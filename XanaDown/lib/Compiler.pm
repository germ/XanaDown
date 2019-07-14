## Wormwood xanadoc compilation
package Compiler;
use lib './';

use strict;
use warnings;

use utf8;
use LWP::Simple;
use List::Util qw( all any );
use URI::URL;
use Encode qw( decode encode );

use EDLParser;
use XLParser;
use XanOrgParser;
use DocBuilder;

my $edl_parse = EDLParser->new;
my $xl_parse  = XLParser->new;
my $xanorg_parse = XanOrgParser->new;

our $xanorg_ext = ".xan.org";
our $edl_ext = ".edl";

our @allowed_uri_schemes = qw( http https );

=head2 _new

Internal. Constructor for Compiler objects. Instead of calling this, call a
builder method like C<from_edl>.

=cut
sub _new {
    my $this = {
        links  => [],
        spans  => [],
        errors => [],
        root   => shift,
        builder => DocBuilder->new,
        force_https => 0
    };

    bless $this;
    return $this;
}

=head2 from_edl

Construct a new xanadoc compiler for an EDL passed as a string.

=cut
sub from_edl {
    my $parse = $edl_parse->from_string(shift);
    my $this = _new(@_);

    push @{ $this->{'spans'} }, grep { $this->fetch_span($_) } @{ $parse->{'spans'} };
    push @{ $this->{'links'} }, grep { $this->fetch_link($_) } @{ $parse->{'links'} };

    return $this;
}

=head2 from_xanorg

Construct a new xanadoc compiler for a XanOrg file passed as a string.

=cut
sub from_xanorg {
    my $parse = $xanorg_parse->from_string(shift);
    my $this = _new(@_);

    # add the body span content as a source first
    $this->{'builder'}->add_source($XanOrgParser::body_url, $parse->{'body'});
    $this->{'builder'}->hide_source($XanOrgParser::body_url);
    $this->{'builder'}->{'doc_type'} = 'org';

    push @{ $this->{'spans'} }, grep { $this->fetch_span($_) } @{ $parse->{'spans'} };
    push @{ $this->{'links'} }, grep { $this->validate_link($_->{'parse'}) } @{ $parse->{'links'} };

    return $this;
}

=head2 from_url

Construct a new xanadoc compiler from a source file available over HTTP. This
may be any compilable format, e.g. EDL or XanOrg.

The file extension of the given URL will be used to determine Source files with the extension C<.xan.org> are interpreted as XanOrg files. Likewise

=cut
sub from_url {
    my %args = @_;
    die "URL parameter is required" unless defined $args{'url'};

    %args = (
        root => 'http://', # TODO: default server root?
        ext  => '.auto',
        %args
        );

    if ($args{'ext'} eq '.auto') {
        $args{'ext'} = ($xanorg_ext eq substr $args{'url'}, -length($xanorg_ext))? $xanorg_ext : $edl_ext;
    }

    # Default to EDL
    my $builder = ($args{'ext'} eq $xanorg_ext)? sub { from_xanorg(@_) } : sub { from_edl(@_) };
    my $self = $builder->(_fetch_content($args{'url'}, $args{'root'}));
    $self->{'url'} = $args{'url'};
    return $self;
}

=head2 _error

Internal. Handle a non-fatal error, e.g. on a missing resource. The error will
be logged and returned to the client.

=cut
sub _error {
    my ($self, $error) = @_;
    push @{ $self->{'errors'} }, $error;
}

=head2 fetch_span

Manually fetch a span from a URL and add to the document as a source doc.

=cut
sub fetch_span {
    my ($self, $span, $root) = @_;
    $root = $root || $self->{'root'};
    my $url = URI::URL->new($span->{'url'}, $root)->abs->as_string;

    $span->{'url'} = $url;
    if (! $self->{'builder'}->has_source($url)) {
        eval {
            $self->{'builder'}->add_source($url, _fetch_content($url, $root));
        };
        if ($@) {
            $self->_error("Could not retrieve content from $url ($@)");
            return 0;
        } else {
            return 1;
        }
    } else {
        return 1;
    }

}

=head2 fetch_link

Manually fetch a xanalink from a URL. The link will be parsed, and all faceted
contents will be added to the document as sourcedocs.

=cut
sub fetch_link {
    my ($self, $link, $root) = @_;
    $root = $root || $self->{'root'};
    my $url = $link->{'url'};

    eval {
        my ($content, $base) = _fetch_content($url, $root);
        $link->{'parse'} = $xl_parse->from_string($content);
    };
    if ($@) {
        $self->_error("Could not retrieve xanalink from $url ($@)");
        return 0;
    } else {
        return $self->validate_link($link->{'parse'});
    }
}

=head2 validate_link

Validate a xanalink by parsing it and fetching each facet.

=cut
sub validate_link {
    my ($self, $parse, $root) = @_;
    $root = $root || $self->{'root'};
    return all { $_ } map {
        $self->fetch_span($_, $root)
    } @{ $parse->{'facets'} };
}

=head2 compile

Compile this xanadoc. The returned structure can be serialized to the client.

=cut
sub compile {
    my $self = shift;

    # Add xanalinks
    foreach my $link (@{ $self->{'links'} }) {
        my $type = $link->{'parse'}->{'type'};
        my $url = $link->{'url'};

        if ($type eq 'typeless') {
            $self->{'builder'}->add_link($link->{'parse'});
        } elsif ($type eq 'HideTransclusions') {
            foreach my $f (@{ $link->{'parse'}->{'facets'} }) {
                $self->{'builder'}->hide_source($f->{'url'});
            }
        } elsif ($type eq 'format') {
            foreach my $f (@{ $link->{'parse'}->{'facets'} }) {
                $self->{'builder'}->{'sources'}->{$f->{'url'}}->{'type'} =
                    $link->{'parse'}->{'parameters'}->{'format'};
            }
        } else {
            $self->_error("Unknown Xanalink type: $type ($url)");
        }
    }

    # add spans
    foreach my $span (@{ $self->{'spans'} }) {
        $self->{'builder'}->add_span($span);
    }

    my $doc = $self->{'builder'}->build();
    $doc->{'errors'} = $self->{'errors'};
    ($doc->{'src_url'} = $self->{'url'}) if defined $self->{'url'};

    return $doc;
}

=head2 _fetch_content

Internal. Fetch content from a URL. If the content cannot be found at the given
URL, it is retried as a URL relative to the contextual root URL. If it isn't a
relative link either, the call dies.

=cut
sub _fetch_content {
    my ($url, $root, %args) = @_;

    my $abs_url = URI::URL->new($url, $root)->abs;

    if ($args{'force_https'}) {
        $abs_url->scheme('https');
    }

    if (any { $abs_url->scheme eq $_ } @allowed_uri_schemes ) {
        $url = $abs_url->as_string;

        my $content = get($url);
        die "Not found: $url" unless defined $content;
        # Decode and re-encode to ensure content is UTF-8
        $content = encode('utf-8', decode('utf-8', $content));
        die "Error decoding content from $url" unless defined $content;
        return ($content, ($url) =~ m/^(.*\/).*$/);
    } else {
        die "URI scheme is not allowed: $url";
    }

}

1
