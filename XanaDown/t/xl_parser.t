#! /usr/bin/env perl

use strict;
use warnings;

use lib 'local/lib/perl5';
use Test::More;
use Pandoc;

use lib 'lib';
use_ok('XLParser');

my $parser = XLParser->new;

my $test_xl_input_1 = <<'END_STR';
jjq7941-xanalink

type=typeless

facet=
span: http://hyperland.com/xuCambDemo/WelcXu-D1y,start=386,length=46

facet=span:http://hyperland.com/xuCambDemo/HTdefOgl.txt,start=23,length=191

# "to an early definition of hypertext"

#  =30=
END_STR

my $test_xl_input_2 = <<'END_STR';
type=HideTransclusions

facet=
sourcedoc: http://hyperland.com/xuCambDemo/WelcXu-D1y
END_STR

my $test_xl_input_3 = <<'END_STR';
type=format

param=
format: none

facet=sourcedoc: relative/link/to/span1.md
facet=sourcedoc: relative/link/to/span2.md
END_STR

my $bad_xl_input = <<'END_STR';
type=typeless

facet=span:http://google.com/"><script>bad_stuff();</script><span",start=0,length=1
END_STR

my $exp_bad_input = 'http://google.com/&gt;&lt;script&gt;bad_stuff();&lt;/script&gt;&lt;span';

my %test_fixtures = (
    $test_xl_input_1 => {
        type       => 'typeless',
        parameters => {},
        facets     => [
            {
                url    => 'http://hyperland.com/xuCambDemo/WelcXu-D1y',
                start  => 386,
                length => 46
            },
            {
                url    => 'http://hyperland.com/xuCambDemo/HTdefOgl.txt',
                start  => 23,
                length => 191
            }
            ]
    },
    $test_xl_input_2 => {
        type       => 'HideTransclusions',
        parameters => {},
        facets     => [
            { url => 'http://hyperland.com/xuCambDemo/WelcXu-D1y' }
            ]
    },
    $bad_xl_input => {
        type       => 'typeless',
        parameters => {},
        facets     => [
            {
                url    => 'http://google.com/&gt;&lt;script&gt;bad_stuff();&lt;/script&gt;&lt;span',
                start  => 0,
                length => 1
            }
            ]
    }
    );

my %needs_pandoc = (
    $test_xl_input_3 => {
        type       => 'format',
        parameters => {
            format  => 'txt'
            },
        facets     => [
            { url => 'relative/link/to/span1.md' },
            { url => 'relative/link/to/span2.md' }
            ]
    },
    );

while( my ($input, $expect) = each %test_fixtures ) {
    my $res = $parser->from_string($input);
    is_deeply($res, $expect, " XLParser result matches expected ");
}
 SKIP: {
     skip "pandoc not installed", 1 unless pandoc;

     while( my ($input, $expect) = each %needs_pandoc ) {
         my $res = $parser->from_string($input);
         is_deeply($res, $expect, " XLParser result matches expected ");
     }
}

done_testing;
