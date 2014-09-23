// configuration section for require js
require.config({
    shim: {

    },
    paths: {
        jquery: '../../bower_components/jquery/dist/jquery'
    },
    packages: [

    ]
});

require([ 'modules/quiz' ], function( quiz ) {
    quiz.init();
});
