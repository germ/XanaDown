## XanOrg Parser
use strict;
use warnings;

package XanOrgParser;
use lib './';
use base qw(Parser::MGC Parse);

our $span_kw  = 'X!span';
our $link_kw  = 'X!link';
our $body_url = 'xanaspace://body';

sub parse {
    my $self = shift;

    my $chunk = "";
    my %doc = (
        body  => "",
        spans => [],
        links => [],
        );

    my $write_chunk = sub {
        if (length $chunk > 0) {
            push @{ $doc{'spans'} }, {
                url        => $body_url,
                start      => length $doc{'body'},
                length     => length $chunk
            };
            $doc{'body'} .= $chunk;
            $chunk = "";
        }
    };

    my $xo_span = sub {
        $self->expect("[");
        $self->expect($span_kw);
        $self->expect(":");
        my $span = $self->parse_span();
        $self->expect("]");

        sub {
            $write_chunk->();
            push @{ $doc{'spans'} }, $span;
        }
    };

    my $xo_link = sub {
        $self->expect("[");
        $self->expect($link_kw);
        $self->expect(":");
        my $span = $self->parse_span();
        $self->expect("]");

        $self->expect("[");
        my $link_text = $self->expect( qr/(?:[^\]]|\\\])+/ );
        $self->expect("]");

        sub {
            push @{ $doc{'links'} }, {
                url   => $body_url,
                parse => {
                    type => 'typeless',
                    params => [],
                    facets => [
                        {
                            url => $body_url,
                            start  => length($doc{'body'}) + length($chunk),
                            length => length($link_text)
                        },
                        $span
                        ]
                }
            };

            $chunk .= $link_text;
        }
    };

    1 while $self->any_of(
        sub {
            # literal block
            $chunk .=
                "#+BEGIN_EXAMPLE\n" .
                $self->scope_of("#+BEGIN_EXAMPLE",
                                sub { $self->expect( qr/.*/ ) },
                                "#+END_EXAMPLE") .
                "\n#+END_EXAMPLE";
            1
        },
        sub {
            # XanOrg element
            $self->expect("[");
            my $commit = $self->any_of(
                sub { $xo_span->() },
                sub { $xo_link->() }
                );
            $self->expect("]");
            $commit->();
            1
        },
        sub {
            # document
            my $next_re = qr/(?:\[\[X!)|(?:#\+BEGIN_EXAMPLE)/;
            # `maybe_expect` consumes whitespace -- TODO file bug report?
            $chunk .= $self->maybe(sub { $self->expect($next_re) }) || "";
            $chunk .= $self->substring_before($next_re);
            if ($self->at_eos) {
                $write_chunk->();
                return 0;
            } else {
                return 1;
            }
        }
        );

    return \%doc;
}

1
