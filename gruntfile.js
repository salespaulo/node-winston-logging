'use strict'

var config = require('config')
var path = require('path')

module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json')

    var paths = {
        app: path.join(path.resolve(), '/src/app'),
        test: path.join(path.resolve(), '/target/test/*.js'),
        target: path.join(path.resolve(), '/target'),
        config: path.join(path.resolve(), '/config')
    }

    var notify = {
        compile: {
            options: {
                title: pkg.name + ': Compile',
                message: 'Finished!'
            }
        },
        test: {
            options: {
                title: pkg.name + ': Test',
                message: 'Finished!'
            }
        },
        zip: {
            options: {
                title: pkg.name + ': ZIP target',
                message: 'Ziped OK!'
            }
        },
        publish: {
            options: {
                title: pkg.name + ': Publish',
                message: 'Published OK!'
            }
        },
        success: {
            options: {
                title: pkg.name + ': Success',
                message: '## Already! ##'
            }
        }
    }

    var shell = {
        exec: {
            command: 'node target/app'
        },
        publish: {
            command: 'cd target && npm publish && cd -'
        }
    }

    var clean = {
        src: ['<%= paths.target %>', path.resolve() + '/*.log', path.resolve() + '/*.txt', path.resolve() + '/*.zip']
    }

    var copy = {
        js: {
            expand: true,
            cwd: path.join('<%= paths.app %>', '/'),
            src: '**/*.js',
            dest: path.join('<%= paths.target %>', '/')
        },
        test: {
            expand: true,
            cwd: path.join(path.resolve(), '/', 'src', 'test'),
            src: '**/*.js',
            dest: path.join('<%= paths.target %>', '/test')
        },
        npm: {
            expand: true,
            cwd: path.resolve(),
            src: 'package.json',
            dest: path.join('<%= paths.target %>', '/')
        },
        json: {
            expand: true,
            cwd: path.join('<%= paths.config %>', '/'),
            src: '**/*.json',
            dest: path.join('<%= paths.target %>', '/config', '/')
        },
        readme: {
            expand: true,
            cwd: path.resolve(),
            src: 'README.MD',
            dest: path.join('<%= paths.target %>', '/')
        }
    }

    var mocha = {
        test: {
            options: {
                reporter: 'spec',
                captureFile: 'test-results.txt',
                quiet: false,
                clearRequireCache: false,
                noFail: false
            },
            src: ['<%= paths.test %>']
        }
    }

    var watch = {
        js: {
            files: ['<%= paths.app %>/**/*.js', path.join(path.resolve(), '/src', '/test', '/**/*.js')],
            tasks: ['copy', 'env:test', 'mochaTest', 'env:dev', 'notify:compile']
        }
    }

    var nodemon = {
        default: {
            script: '<%= paths.target %>/index.js',
            options: {
                cwd: path.resolve(),
                watch: ['<%= paths.target %>'],
                ignore: ['node_modules']
            }
        }
    }

    var concurrent = {
        default: {
            tasks: ['watch', 'nodemon']
        },
        options: {
            logConcurrentOutput: true
        }
    }

    var compress = {
        main: {
            options: {
                archive: path.basename(path.resolve()) + '.zip'
            },
            files: [{ expand: true, cwd: '<%= paths.target %>', src: ['**'] }]
        }
    }

    grunt.initConfig({
        pkg: pkg,
        env: {
            dev: {
                NODE_ENV: 'development'
            },
            test: {
                NODE_ENV: 'test'
            },
            production: {
                NODE_ENV: 'production'
            }
        },
        config: config,
        notify: notify,
        compress: compress,
        shell: shell,
        paths: paths,
        copy: copy,
        mochaTest: mocha,
        clean: clean,
        watch: watch,
        nodemon: nodemon,
        concurrent: concurrent
    })

    require('load-grunt-tasks')(grunt)

    grunt.registerTask('compile', ['clean', 'copy', 'notify:compile'])
    grunt.registerTask('test', ['env:test', 'compile', 'mochaTest', 'notify:test'])

    grunt.registerTask('dev', ['test', 'env:dev', 'notify:success', 'concurrent'])
    grunt.registerTask('prod', ['env:production', 'compile', 'notify:success', 'concurrent'])

    grunt.registerTask('default', ['test', 'env:dev', 'notify:success', 'shell:exec'])

    grunt.registerTask('zip', ['test', 'compress', 'notify:zip'])
    grunt.registerTask('deploy', ['zip', 'shell:publish', 'notify:publish'])
}
