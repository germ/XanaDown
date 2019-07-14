## Xanalink Parser
use strict;
use warnings;

package XLParser;
use lib './';
use base qw(Parser::MGC Parse);

my @xl_types = qw( typeless HideTransclusions format );

sub parse {
    my $self = shift;

    my %link = (
        facets     => [],
        parameters => {}
        );

    # compatability -- Ted likes to prefix xanalinks with the filename
    $self->maybe_expect( qr/[^\s=]+\n/ );

    # parse key-value pairs
    1 while $self->any_of(
        sub {
            # comment
            $self->expect("#");
            $self->substring_before( "\n" );
            1
        },
        sub {
            # type key
            $self->expect("type");
            $self->expect("=");
            $link{'type'} = $self->expect_any(@xl_types);
            1
        },
        sub {
            # facet key
            $self->expect("facet");
            $self->expect("=");
            push @{ $link{'facets'} }, $self->parse_facet();
            1
        },
        sub {
            # parameter key
            $self->expect("param");
            $self->expect("=");
            my ($k, $v) = $self->parse_param();
            $link{'parameters'}->{$k} = $v;
            1
        },
        sub { 0 }
        );

    return \%link;
}
1
