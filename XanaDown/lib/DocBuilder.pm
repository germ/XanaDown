use strict;
use warnings;

package DocBuilder;

use List::Util qw( max min );
use Switch;
use Pandoc;
use HTML::Scrubber;

my @allow = qw[ p b i u s em sup sub strong small hr br table tbody tr td ul ol li code pre span blockquote div img a h1 h2 h3 h4 h5 h6 ];
my @rules = (
    a   => {
        href => 1
    },
    img => {
        alt    => 1,
        src    => 1,
        height => 1,
        width  => 1
    },
    map { $_ => {
        id            => 1,
        class         => 1,
        dir           => 1,
        lang          => 1,
        'data-url'    => 1,
        'data-start'  => 1,
        'data-length' => 1
          }
    } qw( span div h1 h2 h3 h4 h5 h6 )
    );
my $scrubber = HTML::Scrubber->new(
    allow => \@allow,
    rules => \@rules
    );

my $_open_tag_fmt = '<%s id="%s" class="%s" %s>';
my $_tag_data_fmt = 'data-url="%s" data-start="%d" data-length="%d"';
my $_close_tag_fmt = '</%s>';

my $_x_tag_fmt   = "\x{1d}tag=%d\x{1d}";
my $_x_tag_regex = qr/\x{1d}tag=[\d]+\x{1d}/;

sub new {
    my $this = {
        doc_type   => "md", # markup as markdown by default
        span_count => 0,
        link_count => 0,
        sources    => {},
        add        => [],   # doc-level piece table
        x_tags   => {},
        x_id     => 0
    };
    bless $this;
    return $this;
}

=head2 add_source

Add retrieved source content to this document

=cut
sub add_source {
    my ($self, $url, $content) = @_;

    my ($basename) = $url =~ m|^(?:.*/)?(.*)$|;
    my ($filetype) = $url =~ m|^.*\.(.*)$|;

    my $len = length($content);

    $self->{'sources'}->{$url} = {
        hidden   => 0,
        heading  => $basename,
        length   => length($content),
        text     => $content, # original text, read-only
        add      => [],       # add buffer, append-only
        doc_type => $filetype,
    }
}

=head2 _add_to_source

Add a piece-table element to the given source. Used internally.

=cut
sub _add_to_source {
    my ($self, $src_url, $piece) = @_;

    my $p_start = $piece->{'start'};
    my $p_end = $piece->{'start'} + $piece->{'length'};

    # check nesting level & conflicts
    # 'level' is just an ordinal field used to resolve ordering conflicts
    foreach my $a ( @{ $self->{'sources'}->{$src_url}->{'add'} } ) {
        my $a_start = $a->{'start'};
        my $a_end = $a->{'start'} + $a->{'length'};

        my $intersecting = 0;

        if ($p_start < $a_start) {
            if ($p_end <= $a_start || $p_end >= $a_end) {
                #  <piece> </piece> <a> </a> OR <piece> <a> </a> </piece>
                $a->{'level'}++;
            } else {
                # <piece> <a> </piece> </a>
                $intersecting = 1;
            }
        } elsif ($p_start == $a_start) {
            if ($p_end <= $a_end) {
                # <piece> <a> </a> </piece>
                $a->{'level'}++;
            } else {
                # <a> <piece> </piece> </a>
                $piece->{'level'}++;
            }
        } else { # $p_start > $a_start
            if ($p_start >= $a_end || $p_end <= $a_end) {
                # <a> </a> <piece> </piece> OR <a> <piece> </piece> </a>
                $piece->{'level'}++;
            } else {
                # <a> <piece> </a> </piece>
                $intersecting = 1;
            }
        }

        if ($intersecting) {
            my $p_name = $piece->{'type'} . $piece->{'n'};
            my $a_name = $a->{'type'} . $a->{'n'};
            die "Xanalogical error (intersecting elements $p_name ($p_start..$p_end) and $a_name ($a_start..$a_end) in sourcedoc $src_url)";
        }
    }

    push @{ $self->{'sources'}->{$src_url}->{'add'} }, $piece;
}

=head2 has_source

Has the given source URL already been added to the document?

=cut
sub has_source {
    my ($self, $url) = @_;
    return defined $self->{'sources'}->{$url};
}

=head2 hide_source

Hide transclusion of the given source URL

=cut
sub hide_source {
    my ($self, $url) = @_;
    $self->{'sources'}->{$url}->{'hidden'} = 1;
}

=head2 add_link
Add a xanalink to the document
=cut
sub add_link {
    my ($self, $link) = @_;

    foreach my $facet (@{ $link->{'facets'} }) {
        $self->_match_span($facet);
        $self->_add_to_source($facet->{'url'}, {
            type   => "link",
            start  => $facet->{'start'},
            length => $facet->{'length'},
            inline => $facet->{'inline'},
            hidden => $facet->{'hidden'},
            n      => $self->{'link_count'},
            level  => 0
                              });
    }

    $self->{'link_count'}++;
}

=head2 add_span

Add a transcluded span to the document

=cut
sub add_span {
    my ($self, $span) = @_;

    $self->_match_span($span);

    my $url = $span->{'url'};

    $self->_add_to_source($url, {
        type   => "transclude",
        url    => $url,
        start  => $span->{'start'},
        length => $span->{'length'},
        inline => $span->{'inline'},
        hidden => $span->{'hidden'},
        n      => $self->{'span_count'},
        level  => 0
                          });

    push @{ $self->{'add'} }, {
        type   => "transclude",
        url    => $url,
        start  => $span->{'start'},
        length => $span->{'length'},
        inline => $span->{'inline'},
        hidden => $span->{'hidden'},
        n      => $self->{'span_count'}
    };

    $self->{'span_count'}++;
}

=head2 _match_span

Internal. If the given span offset is specified as a regex match, match it and
annotate the span with the start and end of the match.

=cut
sub _match_span {
    my ($self, $span) = @_;
    my $url = $span->{'url'};

    if (defined $span->{'match'}) {
        # Using a regex for span. Get last match
        if ($self->{'sources'}->{ $url }->{'text'} =~ $span->{'match'}) {
            # use first capture group if it exists; otherwise select the entire match
            if ($1) {
                $span->{'start'} = $-[1];
                $span->{'length'} = length $1;
            } else {
                $span->{'start'} = $-[0];
                $span->{'length'} = length $&;
            }
        } else {
            die "Span regex @{[$span->{'match'}]} didn't match anything in $url";
        }
    }

}

=head2 _make_tags

Internal. Helper function that builds open and close tags for a piece, which is
dependent on whether the piece is to be included inline (default) or not, and
whether the piece is in the xanadoc or the source doc.

=cut
sub _make_tags {
    my ($piece, $is_doc, $force_hide) = @_;
    my $inline = defined $piece->{'inline'}? $piece->{'inline'} : 1;
    my $hidden = $force_hide || $piece->{'hidden'};

    my $tag = $inline? 'span' : 'div';
    my $class = $is_doc? "xanadoc " : "sourcedoc ";
    my $id = "";
    my $span_data = "";
    if ($piece->{'type'} eq 'link') {
        $class .= "link ";
        $id .= $is_doc? "xanalink" : "link";
    } elsif ($piece->{'type'} eq 'transclude') {
        if ($hidden) {
            $class = "";
        } else {
            $class .= "transclusion ";
        }
        $id .= $is_doc? "span" : "transclusion";
        $span_data = sprintf($_tag_data_fmt,
                             $piece->{'url'},
                             $piece->{'start'},
                             $piece->{'length'}) unless !$is_doc;
    } else {
        die "Unknown piece type $piece->{'type'}";
    }
    $id .= $piece->{'n'};

    return
        sprintf($_open_tag_fmt,
                $tag,
                $id,
                $class,
                $span_data),
        sprintf($_close_tag_fmt,
                $tag);
}

=head2 _build_source

Internal. Builds a span from a source document. Xanadu elements are inserted as
C<x_tag> references; call C<_finalize> after formatting & scrubbing to
dereference.

=cut
sub _build_source {
    my ($self, $url, $start, $length, $is_doc) = @_;

    my $source = $self->{'sources'}->{$url};

    # clamp start and end to source doc
    $start  = min($source->{'length'}, max(0, $start || 0));
    $length = min($source->{'length'}, max(0, $length || $source->{'length'}));

    # build piece table for span
    my @pieces = ();
    foreach my $piece ( @{ $source->{'add'} } ) {
        if ( $piece->{'start'} < $start
             || $piece->{'start'} + $piece->{'length'} > $start + $length ) {
            # piece is partially out of span -- ignore
            # XXX Alternatively, we could crop the piece to the span. Hmm.
            next;
        } else {
            my ($open_tag, $close_tag) = _make_tags($piece, $is_doc, $source->{'hidden'});
            # add open tag
            push @pieces, {
                idx   => $piece->{'start'},
                level => $piece->{'level'},
                text  => $open_tag
            };

            # add close tag
            push @pieces, {
                idx   => $piece->{'start'} + $piece->{'length'},
                level => $piece->{'level'},
                text  => $close_tag
            };
        }
    }

    # sort piece table
    @pieces = sort {
        if ($a->{'idx'} == $b->{'idx'}) {
            return $b->{'level'} <=> $a->{'level'};
        } else {
            return $a->{'idx'} <=> $b->{'idx'};
        }
    } @pieces;

    # write piece table to document.
    my $ret = "";
    my $idx = $start;
    foreach my $p (@pieces) {
        # fast-forward to start of piece
        if ($idx < $p->{'idx'}) {
            $ret .= substr $source->{'text'}, $idx, ($p->{'idx'} - $idx);
            $idx = $p->{'idx'};
        }

        # add x_tag, to be written on finalize
        my $x_tag = sprintf($_x_tag_fmt, $self->{'x_id'}++);
        $self->{'x_tags'}->{$x_tag} = $p->{'text'};

        # if the piece is at the start of a line, add a line break afterwards
        # this fixes issues with the formatter missing start-of-line tokens
        if ( (substr $source->{'text'}, 0, $idx) =~ m/^\s*$/) {
            $x_tag .= "\n";
        }

        $ret .= $x_tag;
    }

    # fast-forward to end of span
    if ($idx < $start + $length) {
        $ret .= substr $source->{'text'}, $idx, ($start + $length - $idx);
        $idx = $start + $length;
    }

    return $ret;
}

=head2 _build_doc

Internal. Builds the xanadoc. As with C<_build_source>, you must call
C<_finalize> to dereference Xanadu elements from the returned document.

=cut
sub _build_doc {
    my $self = shift;

    my $ret = "";
    foreach my $p (@{ $self->{'add'} }) {
        $ret .= $self->_build_source($p->{'url'}, $p->{'start'}, $p->{'length'}, 1);
    }

    return $ret;
}

=head2 _markup

Internal. Yields a handle to the appropriate function for marking-up the given
type of document.

=cut
sub _markup {
    my $type = shift;

    if (pandoc) {
        if (grep { $_ eq $type } pandoc->input_formats()) {
            return sub { pandoc->convert($type => 'html', shift) };
        } elsif ("md" eq $type) {
            return sub { pandoc->convert('markdown' => 'html', shift) };
        }
    }
    return sub { shift =~ s/\n/\n<br>/gr }; # fallback -- just substitute <br> for line breaks
}

=head2 _finalize

Internal. Dereference Xanadu elements in a document.

These elements must be inserted after formatting to avoid conflict with pandoc
mark-up and HTML scrubbing, which should be applied to the compiled document. As
a workaround, we insert references during compilation that can be dereferenced
after post-compilation processing.

=cut
sub _finalize {
    my ($self, $content) = @_;

    my $deref = sub {
        return $self->{'x_tags'}->{(shift)} || "";
    };
    $content =~ s/($_x_tag_regex)/@{[$deref->($1)]}/g;

    return $content;
}

=head2 build

Finalize the document into a format that can be serialized to the client.

=cut
sub build {
    my $self = shift;

    my $doc = $self->_finalize(
        $scrubber->scrub(_markup($self->{'doc_type'})->($self->_build_doc()))
        );

    my @source = map {
        my $url = $_;
        my $s = $self->{'sources'}->{$url};
        {
            heading => $s->{'heading'},
            length  => $s->{'length'},
            type    => $s->{'doc_type'},
            url     => $url,
            text    => $self->_finalize(
                $scrubber->scrub(_markup($s->{'doc_type'})->($self->_build_source($url)))
                )
        }
    } grep { $self->{'sources'}->{$_}->{'hidden'} == 0 } keys %{ $self->{'sources'} };

    return {
        doc        => $doc,
        link_count => $self->{'link_count'},
        span_count => $self->{'span_count'},
        source     => \@source,
    };
}

1
