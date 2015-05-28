/*

%%javascript

window.load_remote_theme = false;
var theme_url = "https://drostehk.github.io/ipynb-theme/";
var asset_url = 'https://raw.githubusercontent.com/tijptjik/DS_assets/master/';

window.load_local_theme = function(){
    var hostname = document.location.hostname;
    return ((hostname == "localhost" || hostname == '127.0.0.1') && !load_remote_theme);
}

var url = load_local_theme() ? document.location.origin + "/files/theme/custom.js" : theme_url + 'custom.js'

$.getScript(url)


*/

console.log('hello')

// Theme and Asset base URLs, change these to your fork.

if (typeof theme_url !== 'undefined'){
    var theme_url   = 'http://drostehk.github.io/ipynb-theme/'
}
if (typeof asset_url !== 'undefined'){
    var asset_url   = 'https://drostehk.github.io/notebook-assets/'
}


// Hide the theme Cell

$('.cell:first').hide()

// Load the styles

if (load_local_theme()){
    theme_url = document.location.origin + '/files/theme/'
}

$('<link>')
  .appendTo($('head'))
  .attr({type : 'text/css', rel : 'stylesheet'})
  .attr('href', theme_url + 'custom.css');

// Insert stylised elements

$('<img>')
  .prependTo($('h1'))
  .attr({src : 'assets/nodes.png', alt : 'break', class : 'lead'});

// Load the assets

if (load_local_theme()){
    asset_url = document.location.origin + '/files/assets/'
}

$('img[src^="assets/"]').each(
    function(){
        var $this = $(this);
        var img = $this.attr('src').split('/')[1];
        $this.attr('src', asset_url + img)
    }
)

// Create events for jQuery show and hide methods

$.each(['show', 'hide'], function (i, ev) {
    var el = $.fn[ev];
    $.fn[ev] = function () {
        this.trigger(ev);
        return el.apply(this, arguments);
    };
});

// Render Resource Blocks - see for example http://prologue.datascience.hk

$('.rendered_html').on('show', function() {
    var resource_img = $('[alt="resource"]').map(function(i,e){return $(e).attr('src')})
    var resource_text = $('[alt="resource"]').siblings('a').map(function(i,e){return $(e).text()})
    var resource_links = $('[alt="resource"]').siblings('a').map(function(i,e){return $(e).attr('href')})

    $('[alt="resource"]').each(function(i,e){
        $p = $(e).parent('p');
        $p.empty()
            .addClass('resource-container')
            .append('<a>')
            .find('a')
            .attr('href', resource_links[i])
            .append('<div>')
            .find('div')
            .css('background-image','url(' + resource_img[i]+')')
            .parent()
            .append('<p>')
            .find('p')
            .text(resource_text[i])
    })
})

$('.rendered_html').trigger('show')

// Gist Integration

IPython.ext_update_gist_link = function(gist_id) {

    IPython.notebook.metadata.gist_id = gist_id;
    var toolbar = IPython.toolbar.element;
    var link = toolbar.find("a#nbviewer");
    if ( ! link.length ) {
        link = $('<a id="nbviewer" target="_blank"/>');
        toolbar.append(
            $('<span id="nbviewer_span"/>').append(link)
        );
    }

    link.attr("href", "http://nbviewer.ipython.org/" + gist_id);
    link.text("http://nbviewer.ipython.org/" + gist_id);
};

IPython.ext_handle_gist_output = function(output_type, content) {
    console.log(output_type)
    console.log(content)
    alert("Gist is loaded: ");
    if (output_type != 'stream' || content['name'] != 'stdout') {
        return;
    }
    var gist_id = jQuery.trim(content['data']);
    if (! gist_id.match(/[A-Za-z0-9]+/g)) {
        alert("Gist seems to have failed: " + gist_id);
        return;
    }
    IPython.ext_update_gist_link(gist_id);
};

IPython.ext_gist_notebook = function () {
    var gist_id = IPython.notebook.metadata.gist_id || null;
    var cmd = '_nbname = "' + IPython.notebook.notebook_name + '"';
    cmd = cmd + '\nlines = !gist -p'
    if (gist_id) {
        cmd = cmd + ' -u ' + gist_id;
    }
    cmd = cmd + ' $_nbname';
    cmd = cmd + '\nprint lines[0].replace("https://gist.github.com", "").replace("/","")';
    var callbacks = { 'iopub' : {'output' : IPython.ext_handle_gist_output}};
    var x = IPython.notebook.kernel.execute(cmd, callbacks, {silent:false});
    console.log('ran')
    console.log(x)
};

setTimeout(function() {
    if ($("#gist_notebook").length == 0) {
        IPython.toolbar.add_buttons_group([
            {
                'label'   : 'Share Notebook as gist',
                'icon'    : 'icon-share',
                'callback': IPython.ext_gist_notebook,
                'id'      : 'gist_notebook'
            },
        ])
    }

    if (IPython.notebook.metadata.gist_id) {
        IPython.ext_update_gist_link(IPython.notebook.metadata.gist_id);
    }
}, 1000);
