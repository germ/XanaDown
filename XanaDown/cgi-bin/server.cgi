#! /usr/bin/perl

use utf8;
use lib 'local/lib/perl5';
use CGI qw( -debug :standard );
use CGI::Carp qw( fatalsToBrowser );
use JSON::PP;
use Switch;
use Data::Dumper;

use lib 'lib';
use Compiler;

my $cgi = CGI->new();

my $status = "418 I'm a teapot";
my $response = {};

my ($server_root) = $cgi->url() =~ m|^(.*\/).*$|;
my $compiler;

eval {
    if ( $cgi->param('url') ) {
        $compiler = Compiler::from_url(url => $cgi->param('url'),
                                       root => $server_root);
    } elsif( $cgi->param('xanorg') ) {
        $compiler = Compiler::from_xanorg($cgi->param('xanorg'), $server_root);
    } elsif( $cgi->param('edl') ) {
        $compiler = Compiler::from_edl($cgi->param('edl'), $server_root);
    } else {
        die "Unrecognized request: expected url, edl, or xanorg CGI param";
    }
    $response = $compiler->compile();
};
if ($@) {
    $status = "400 Bad Request";
    $response->{'debug'} = {
        message  => Dumper($response),
        compiler => Dumper($compiler)
    };
    $response->{'message'} = "Document could not be compiled ($@)";
} else {
    $status = "200 OK";
}

my $response_json = JSON::PP->new->encode($response);

# Print JSON response
print header(-type => 'application/json', -charset => 'utf-8');

print $response_json;
