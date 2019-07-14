#! /usr/bin/env perl
# XXX these tests aren't very good. Consider refactoring DocBuilder

use strict;
use warnings;

use feature qw( say );

use lib 'local/lib/perl5';
use Test::More;

use lib 'lib';
use_ok('DocBuilder');

my %test_sources = (
    'http://span_1.txt' =>
    "This span should be hidden.\nThis link should also be hidden.",
    'http://span_2.txt' =>
    "This span should be transcluded and xanalinked. <script>alert('Uh oh!');</script>"
    );

my $exp_sources = {
    'http://span_2.txt' => {
        heading => 'span_2.txt',
        text => "This span should be transcluded and xanalinked. <script>alert('Uh oh!');</script>",
        hidden => 0,
        length => 81,
        add => [
            {
                type => 'link',
                start => 36,
                length => 10,
                hidden => undef,
                inline => undef,
                n => 0,
                level => 1
            },
            {
                type => 'transclude',
                url => 'http://span_2.txt',
                start => 0,
                length => 47,
                hidden => undef,
                inline => 0,
                n => 1,
                level => 0
            }
            ],
        doc_type => 'txt'
    },
    'http://span_1.txt' => {
        heading => 'span_1.txt',
        text => "This span should be hidden.\nThis link should also be hidden.",
        hidden => 1,
        length => 60,
        add => [
            {
                type => 'link',
                start => 28,
                length => 9,
                hidden => undef,
                inline => undef,
                n => 0,
                level => 2,
            },
            {
                type => 'link',
                start => 20,
                length => 7,
                hidden => undef,
                inline => undef,
                n => 1,
                level => 1,
            },
            {
                type => 'link',
                start => 53,
                length => 7,
                hidden => undef,
                inline => undef,
                n => 1,
                level => 4,
            },
            {
                type => 'transclude',
                url => 'http://span_1.txt',
                start => 0,
                length => 28,
                hidden => undef,
                inline => 1,
                n => 0,
                level => 0,
            },
            {
                type => 'transclude',
                url => 'http://span_1.txt',
                start => 28,
                length => 32,
                hidden => undef,
                inline => 0,
                n => 2,
                level => 3
            }
            ],
        doc_type => 'txt'
    }
};

my $exp_pieces =  [
    {
        type => 'transclude',
        url => 'http://span_1.txt',
        start => 0,
        length => 28,
        hidden => undef,
        inline => undef,
        n => 0,
        inline => 1
    },
    {
        type => 'transclude',
        url => 'http://span_2.txt',
        start => 0,
        length => 47,
        hidden => undef,
        inline => undef,
        n => 1,
        inline => 0
    },
    {
        type => 'transclude',
        url => 'http://span_1.txt',
        start => 28,
        length => 32,
        hidden => undef,
        inline => undef,
        n => 2,
        inline => 0
    }
    ];

my $exp_build = {
    link_count => 2,
    span_count => 3,
    source => [
        {
            url => 'http://span_2.txt',
            heading => 'span_2.txt',
            text => '<div id="transclusion1" class="sourcedoc transclusion " >
<br>This span should be transcluded and <span id="link0" class="sourcedoc link " >xanalinked</span>.</div> ',
            length => 81,
            type => 'txt'
        }
        ],
    doc => '<span id="span0" class="" data-url="http://span_1.txt" data-start="0" data-length="28">
<br>This span should be <span id="xanalink1" class="xanadoc link " >hidden.</span>
<br></span><div id="span1" class="xanadoc transclusion " data-url="http://span_2.txt" data-start="0" data-length="47">
<br>This span should be transcluded and <span id="xanalink0" class="xanadoc link " >xanalinked</span>.</div><div id="span2" class="" data-url="http://span_1.txt" data-start="28" data-length="32"><span id="xanalink0" class="xanadoc link " >This link</span> should also be <span id="xanalink1" class="xanadoc link " >hidden.</span></div>'
        };

my $builder = DocBuilder->new;
$builder->{'doc_type'} = 'txt';

while( my ($url, $content) = each %test_sources ) {
    $builder->add_source($url, $content);
}

$builder->hide_source("http://span_1.txt");

$builder->add_link(
    {
        type   => 'typeless',
        facets => [
            {
                url    => 'http://span_1.txt',
                start  => 28,
                length => 9
            },
            {
                url    => 'http://span_2.txt',
                start  => 36,
                length => 10
            }
            ]
    });

$builder->add_link(
    {
        type   => 'typeless',
        facets => [
            {
                url    => 'http://span_1.txt',
                start  => 20,
                length => 7
            },
            {
                url    => 'http://span_1.txt',
                start  => 53,
                length => 7
            }
            ]
    });

$builder->add_span(
    {
        url    => 'http://span_1.txt',
        start  => 0,
        length => 28,
        n      => 0,
        inline => 1
    });

$builder->add_span(
    {
        url    => 'http://span_2.txt',
        start  => 0,
        length => 47,
        n      => 1,
        inline => 0
    });

$builder->add_span(
    {
        url    => 'http://span_1.txt',
        start  => 28,
        length => 32,
        n      => 2,
        inline => 0
    });

is_deeply($builder->{'sources'}, $exp_sources, " DocBuilder sources match expected ");
is($builder->{'link_count'}, 2, " Link count matches expected ");
is($builder->{'span_count'}, 3, " Span count matches expected ");
is_deeply($builder->{'add'}, $exp_pieces, " Doc piece table matches expected ");

is_deeply($builder->build, $exp_build, " Builder finalized result matches ");

done_testing;
