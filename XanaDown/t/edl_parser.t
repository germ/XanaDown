#! /usr/bin/env perl

use strict;
use warnings;

use lib 'local/lib/perl5';
use Test::More;

use lib 'lib';
use_ok('EDLParser');

my $parser = EDLParser->new;

my $test_edl_input = <<'END_STR';
# Welcoming EDL, with comments

# Intro text, with three links
span: http://hyperland.com/xuCambDemo/WelcXu-D1y,start=25,length=567
# Moe Juste transclusion
span: http://xanadu.com/xanadox/MoeJuste/sources/0-Moe.pscr.txt,start=7995,length=274
# "Or consider this quote from Darwin--"
span: http://hyperland.com/xuCambDemo/WelcXu-D1y,start=590,length=41
# Actual quote from Darwin
span: http://xanadu.com/xanadox/MoeJuste/sources/2-DarwinDescentOfMan.txt,start=143522,length=213
# "Or consider this note from a journal''"
span: http://hyperland.com/xuCambDemo/WelcXu-D1y,start=628,length=59
# First quote from J. Ineffable Conundra
span: http://royalty.pub/Ineffable/17/32/Trovato,start=299,length=343
# "And yet another quote from journal:"
span: http://hyperland.com/xuCambDemo/WelcXu-D1y,start=685,length=55
# Second quote from J. Ineffable Conundra
span: http://royalty.pub/Ineffable/17/32/Trovato,start=2879,length=376
#  Final text: "The journal needs to get paid...
# on to ...
# "We hope this new medium will be deep ...
span: http://hyperland.com/xuCambDemo/WelcXu-D1y,start=738,length=119

# XANALINKS
# Suppress view of new content
# Don't transclude the recent writing
xanalink: http://perma.pub/links/hide_new.xanalink.txt

# Connection to McKinley Assasination
xanalink: http://hyperland.com/xuCambDemo/rmq41-xanalink.txt

# Connection to scientific article
xanalink: http://hyperland.com/xuCambDemo/mexn86-xanalink.txt

# Connection to original def. of hypertext
xanalink: http://hyperland.com/xuCambDemo/jjq7941-xanalink.txt

# =30=
END_STR

my $test_edl_res = {
    'links' => [
        { url => 'http://perma.pub/links/hide_new.xanalink.txt' },
        { url => 'http://hyperland.com/xuCambDemo/rmq41-xanalink.txt' },
        { url => 'http://hyperland.com/xuCambDemo/mexn86-xanalink.txt' },
        { url => 'http://hyperland.com/xuCambDemo/jjq7941-xanalink.txt' }
        ],
        'spans' => [
            {
                url => 'http://hyperland.com/xuCambDemo/WelcXu-D1y',
                start => 25,
                length => 567
            },
            {
                url => 'http://xanadu.com/xanadox/MoeJuste/sources/0-Moe.pscr.txt',
                start => 7995,
                length => 274
            },
            {
                url => 'http://hyperland.com/xuCambDemo/WelcXu-D1y',
                length => 41,
                start => 590
            },
            {
                url => 'http://xanadu.com/xanadox/MoeJuste/sources/2-DarwinDescentOfMan.txt',
                start => 143522,
                length => 213
            },
            {
                length => 59,
                start => 628,
                url => 'http://hyperland.com/xuCambDemo/WelcXu-D1y'
            },
            {
                url => 'http://royalty.pub/Ineffable/17/32/Trovato',
                length => 343,
                start => 299
            },
            {
                length => 55,
                start => 685,
                url => 'http://hyperland.com/xuCambDemo/WelcXu-D1y'
            },
            {
                url => 'http://royalty.pub/Ineffable/17/32/Trovato',
                length => 376,
                start => 2879
            },
            {
                url => 'http://hyperland.com/xuCambDemo/WelcXu-D1y',
                length => 119,
                start => 738
            }
        ]
};

my %test_fixtures = (
    '# This is a comment' => {
        spans => [],
        links => []
    },
    'span: http://hyperland.com/xuCambDemo/WelcXu-D1y,start=25,length=567' => {
        spans => [{
            url     => "http://hyperland.com/xuCambDemo/WelcXu-D1y",
            start   => 25,
            length  => 567
                  }],
        links => []
    },
    'xanalink: http://hyperland.com/xuCambDemo/jjq7941-xanalink.txt' => {
        spans => [],
        links => [
            { url => "http://hyperland.com/xuCambDemo/jjq7941-xanalink.txt" }
            ]
    },
    'span: http://hyperland.com/xuCambDemo/WelcXu-D1y"><script>alert();</script><span",start=25,length=567' => {
        spans => [{
            url    => "http://hyperland.com/xuCambDemo/WelcXu-D1y&gt;&lt;script&gt;alert();&lt;/script&gt;&lt;span",
            start  => 25,
            length => 567
                  }],
        links => []
    },
    'span: www.google.com,start=420,length=69,inline=yes' => {
        spans => [{
            url    => "www.google.com",
            start  => 420,
            length => 69,
            inline => 1
                  }],
        links => []
    },
    'span: relative/path/to/file.txt,start=0,length=100,inline=false' => {
        spans => [{
            url    => "relative/path/to/file.txt",
            start  => 0,
            length => 100,
            inline => 0
                  }],
        links => []
    },
    'span: relative/path/to/file.txt,match=/My Element:.*heres:\/\/the_end/,inline=no' => {
        spans => [{
            url    => "relative/path/to/file.txt",
            match => qr/My Element:.*heres:\/\/the_end/s,
            inline => 0
                  }],
        links => []
    },
    $test_edl_input => $test_edl_res
    );

while( my ($input, $expect) = each %test_fixtures ) {
    my $res = $parser->from_string($input);
    is_deeply($res, $expect, " EDLParser result matches expected ");
}

done_testing;
