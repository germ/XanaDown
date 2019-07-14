## Shared behavior for EDL & Xanalink parsers
package Parse;
use strict;
use warnings;

use Sanitize;
use Pandoc;

my $_url_token = qr/(?:https?:\/\/)?[^\s,]+/;

my @_false_tokens = qw( none no false off 0 );
my @_true_tokens = qw( yes true on 1 );

=head2 expect_any

Expect any of a list of literals.

=cut
sub expect_any {
    my $self = shift;
    $self->any_of(
        map { my $v = $_; sub { $self->expect($v) } } @_
        )
}

=head2 token_false

Parse a representation of a false boolean value (C<0>).
For instance, "false", "no", and "off" are parsed as false.

=cut
sub token_false {
    shift->expect_any(@_false_tokens);
    0
}

=head2 token_true

Parse a representation of a true boolean value (C<1>).
For instance, "true", "yes", and "on" are parsed as true.

=cut
sub token_true {
    shift->expect_any(@_true_tokens);
    1
}

=head2 token_boolean

Parse a representation of a boolean value.
This just wraps C<token_false> and C<token_true> in an C<any_of> condition.

=cut
sub token_boolean {
    my $self = shift;

    $self->any_of(
        sub { $self->token_true() },
        sub { $self->token_false() }
        )
}

=head2 token_pandoc_fmt

Parse a span formatting option. Valid options are from
C<Pandoc::input_formats()>. Alternatively, "txt" or a C<token_false> value will
force formatting to be disabled.

=cut
sub token_pandoc_fmt {
    my $self = shift;

    $self->any_of(
        sub {
            $self->any_of(
                sub { $self->expect("txt") },
                sub { $self->token_false() }
                );
            "txt"
        },
        sub {
            $self->expect("md");
            "markdown"
        },
        map { my $f = $_; sub { $self->expect($f) } } pandoc->input_formats()
        )
}

=head2 token_regex

Parse a simple regular expression, delimited by slashes (/)

=cut
sub token_regex {
    my $self = shift;

    my ($pat) = $self->scope_of("/",
                    sub { $self->expect( qr{((\\\/)|[^\/\n\r])*} ) =~ s{\\/}{/}gr },
                              "/");
    return qr/$pat/s;
}

=head2 parse_kv

   my ($key, $value)  = $parser->parse_kv([ qw( allowed keys ) ], $code, $assign);

Parse a key-value pair. Expect any of C<allowed keys>, then the C<$assign> operator,
then use C<$code> to parse a value.

C<$assign> is optional; the default assignment operator is ":".

=cut
sub parse_kv {
    my ($self, $keys, $code, $assign) = @_;

    my $key = $self->expect_any( @$keys );
    $self->expect($assign || ":");

    return $key, $code->();
}

sub parse_span {
    my $self = shift;

    my %span = (
        url => $self->parse_link()->{'url'}
        );

    1 while $self->any_of(
        sub {
            # field delimiter
            $self->expect(",");
            1
        },
        (
         map {
             my @kc = @$_;
             sub {
                 %span = ( %span, $self->parse_kv(@kc, '=') );
                 1
             }
         }
         [ [qw( start length )], sub { $self->token_int } ],
         [ [qw( inline )], sub { $self->token_boolean } ],
         [ [qw( match )], sub { $self->token_regex } ],
         # [ [qw( format )], sub { $self->token_pandoc_fmt } ]
        ),
        sub { 0 }
        );

    return \%span;
}

sub parse_link {
    my $self = shift;

    return { url => sanitize($self->generic_token(url => $_url_token),
                             html => 1,
                             nospace => 1,
                             rtrim => 1,
                             ltrim => 1,
                             noquote => 1
                 )
    };
}

sub parse_facet {
    my $self = shift;

    $self->any_of(
        map {
            my @kc = @$_;
            sub { ($self->parse_kv(@kc))[1] }
        }
        [ ['sourcedoc'], sub { $self->parse_link } ],
        [ ['span'], sub { $self->parse_span } ]
        )
}

sub parse_param {
    my $self = shift;
    my ($k, $v);
    $self->any_of(
        sub {
            $k = $self->expect("format");
            $self->expect(":");
            $v = $self->token_pandoc_fmt();
        }
        );
    return ($k, $v);
}

1
