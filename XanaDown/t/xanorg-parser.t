#! /usr/bin/env perl

use strict;
use warnings;

use lib 'local/lib/perl5';
use Test::More;

use lib 'lib';
use_ok('XanOrgParser');

my $parser = XanOrgParser->new;

my $test_xo_input_1 = <<'END_STR';
header [[http://corn.org][with a link]]

* Section
  transclusion: [[X!span:path/to/doc.txt,start=0,length=100]] is transcluded
END_STR

my $test_xo_input_2 = <<'END_STR';
header with [[X!link:path/to/doc.txt,start=0,length=100][this]] xanalink.
* Section
  and also [[http://corn.org][a jumplink]]
END_STR

my $test_xo_input_3 = <<'END_STR';
this doc has [[X!link:path/to/doc.txt,start=0,length=100][one xanalink]].

#+BEGIN_EXAMPLE
Xanalinks look like this: [[X!link:path/to/doc.txt,start=0,length=100][link text]]
#+END_EXAMPLE
(in case you were wondering)
END_STR

my $bad_xo_input_1 = <<'END_STR';
header [[http://corn.org][with a link]]

* Section
  transclusion: [[X!span:path/to/doc.txt,start=0,length=100] is malformed
END_STR

#][

my $bad_xo_input_2 = <<'END_STR';
header with [[X!link:path/to/doc.txt,start=0,length=100]malformed]] xanalink.
* Section
  and also [[http://corn.org][a jumplink]]
END_STR

my %test_fixtures = (
    $test_xo_input_1 => {
        body => "header [[http://corn.org][with a link]]

* Section
  transclusion:  is transcluded
",
        links => [],
        spans => [
            {
                start => 0,
                url => $XanOrgParser::body_url,
                length => 67
            },
            {
                length => 100,
                url => 'path/to/doc.txt',
                start => 0,
            },
            {
                url => $XanOrgParser::body_url,
                length => 16,
                start => 67
            }
            ]
    },
    $test_xo_input_2 => {
        body => "header with this xanalink.
* Section
  and also [[http://corn.org][a jumplink]]
",
        spans => [
            {
                start => 0,
                url => $XanOrgParser::body_url,
                length => 80
            }
            ],
        links => [
            {
                url => $XanOrgParser::body_url,
                parse =>
                {
                    params => [],
                    facets => [
                        {
                            length => 4,
                            start => 12,
                            url => $XanOrgParser::body_url
                        },
                        {
                            url => 'path/to/doc.txt',
                            start => 0,
                            length => 100
                        }
                        ],
                    type => 'typeless'
                }
            }
            ]
    },
    $test_xo_input_3 => {
        links => [
            {
                parse => {
                    params => [],
                    facets => [
                        {
                            url => $XanOrgParser::body_url,
                            length => 12,
                            start => 13
                        },
                        {
                            length => 100,
                            start => 0,
                            url => 'path/to/doc.txt'
                        }
                        ],
                    type => 'typeless'
                },
                url => $XanOrgParser::body_url
            }
            ],
        spans => [
            {
                url => $XanOrgParser::body_url,
                length => 170,
                start => 0
            }
            ],
        body => 'this doc has one xanalink.

#+BEGIN_EXAMPLE
Xanalinks look like this: [[X!link:path/to/doc.txt,start=0,length=100][link text]]
#+END_EXAMPLE
(in case you were wondering)
'
    },
    $bad_xo_input_1 => {
        spans => [
            {
                url => $XanOrgParser::body_url,
                length => 125,
                start => 0
            }
            ],
        links => [],
        body => 'header [[http://corn.org][with a link]]

* Section
  transclusion: [[X!span:path/to/doc.txt,start=0,length=100] is malformed
'
    },
    $bad_xo_input_2 => {
        links => [],
        spans => [
            {
                start => 0,
                length => 131,
                url => $XanOrgParser::body_url
            }
            ],
        body => 'header with [[X!link:path/to/doc.txt,start=0,length=100]malformed]] xanalink.
* Section
  and also [[http://corn.org][a jumplink]]
'
    }
    );

while( my  ($input, $expect) = each %test_fixtures ) {
    my $res = $parser->from_string($input);
    is_deeply($res, $expect, " XanOrgParser result matches expected ");
}

done_testing;
