## Edit Decision List parser
package EDLParser;
use lib './';
use base qw(Parser::MGC Parse);

sub parse {
    my $self = shift;

    my %edl = (
        spans => [],
        links => []
        );
    1 while $self->any_of(
        sub {
            # comment
            $self->expect("#");
            $self->substring_before( "\n" );
            1
        },
        sub {
            # span
            $self->expect("span");
            $self->expect(":");
            push @{ $edl{'spans'} }, $self->parse_span();
            1
        },
        sub {
            # xanalink
            $self->expect("xanalink");
            $self->expect(":");
            push @{ $edl{'links'} }, $self->parse_link();
            1
        },
        sub { 0 }
        );

    return \%edl;
}

1
