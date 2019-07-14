#! /usr/bin/env perl
## This is just a wrapper around the Cambridge Xanadu client.
## CGI params are passed to the server. Use this to link directly to xanadocs in www.

use lib 'local/lib/perl5';
use CGI qw(-debug :standard);
use CGI::Carp qw(fatalsToBrowser);

my $cgi = CGI->new();

my $on_ready = "\$('document').ready(function(){%s});";
if ($cgi->param('url')) {
    $on_ready = sprintf($on_ready,
                        "fulfil({'url': '".$cgi->param('url')."'});"
        );
} elsif ($cgi->param('edl')) {
    $on_ready = sprintf($on_ready,
                        "fulfil({'edl': '".$cgi->param('edl')."'});"
        );
}

print header(-type => 'text/html');

print <<END_PAGE;
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wormwood</title>
<link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="../static/css/style.css">
</head>
<body>
<script id="document-template" type="text/x-handlebars-template">
    <div class="document {{ doctype }}" id="doc{{ docid }}">
        <div class="heading" id="head{{ docid }}">
            <span class="controls">
                {{#if decorated}}
				<a href="{{ url }}" target="_blank" class="close btn btn-default" aria-label="Source">
                    <span aria-hidden="true">{}</span>
                </a>
                <button type="button" class="close btn btn-default" aria-label="Close" onclick="toggle_doc(\$(this).closest('.document'), false);">
                    <span aria-hidden="true">&times;</span>
                </button>
				{{/if}}
            </span>
            {{ heading }}
        </div>
        <div class="wrapper">
            <div class="body" id="body{{ docid }}">
                {{{ text }}}
            </div>
        </div>
    </div>
</script>
<script id="alert-template" type="text/x-handlebars-template">
    <div class="list-group-item list-group-item-{{level}} alert alert-dismissable alert-{{level}}" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    {{{ text }}}
    </div>
</script>
<svg id="svg" class="tile-fg" version="1.2" xmlns="http://www.w3.org/2000/svg"></svg>
<div id="top"></div>
<div id="alerts" class="list-group"></div>
<div id="tiling"></div>
<div id="tile-strat-ctl" class="btn btn-primary tile-fg"></div>
<script src="../bower_components/jquery/dist/jquery.min.js"></script>
<script src="../bower_components/interactjs/dist/interact.min.js"></script>
<script src="../static/js/app.js"></script>
<script src="../static/js/tile.js"></script>
<script src="../bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="../bower_components/handlebars/handlebars.min.js"></script>
<script>
var fulfil_edl_path = "server.cgi";
$on_ready
</script>
</body>
</html>
END_PAGE
