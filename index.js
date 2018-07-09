const exec = require('child_process')
    .exec;

module.exports = {
    hooks:
    {
        // For all the hooks, this represent the current generator

        // This is called before the book is generated
        "init": function() {},

        // This is called after the book generation
        "finish": function()
        {
            var fs = require('fs');
            var path = require('path');
            //Use relative directory.
            var filePath = './';
            copy_pdf(filePath);

            function copyFile(source, target, cb) {
                // console.log("CopyFile", source, target);
                var ensureDirectoryExistence = function (filePath) {
                    var dirname = path.dirname(filePath);
                    if (fs.existsSync(dirname)) {
                        return true;
                    }
                    ensureDirectoryExistence(dirname);
                    fs.mkdirSync(dirname);
                }
                ensureDirectoryExistence(target);
            
                var cbCalled = false;
                var rd = fs.createReadStream(source);
                rd.on("error", function (err) {
                    done(err);
                });
                var wr = fs.createWriteStream(target);
                wr.on("error", function (err) {
                    done(err);
                });
                wr.on("close", function (ex) {
                    done();
                });
                rd.pipe(wr);
                function done(err) {
                    if (!cbCalled) {
                        cb(err);
                        cbCalled = true;
                    }
                }
            }
            
            function copyFilePromise(source, target) {
                return new Promise(function (accept, reject) {
                    copyFile(source, target, function (data) {
                        if (data === undefined) {
                            accept();
                        } else {
                            reject(data);
                        }
                    });
                });
            }

            function copy_pdf(filePath)
            {
                //Return file list
                fs.readdir(filePath, function(err, files)
                {
                    if (err)
                    {
                        console.warn(err)
                    }
                    else
                    {
                        //Traverse files in file list.  
                        files.forEach(function(filename)
                        {
                            var filedir = path.join(filePath, filename);
                            var filePath_new = path.join('./_book', filePath);
                            var filedir_new = path.join(filePath_new,filename);
                            //Return fs.Stats object  
                            fs.stat(filedir, function(eror, stats)
                            {
                                if (eror)
                                {
                                    console.warn('Get file stats failed');
                                }
                                else
                                {
                                    var isFile = stats.isFile();
                                    var isDir = stats.isDirectory();
                                    if (isFile)
                                    {
                                        var extension = path.extname(filename);
                                        if (".pdf" == extension.toLowerCase())
                                        {
                                            if(false == fs.existsSync(filePath_new)){
                                                fs.mkdir(filePath_new, (err) => {
                                                    if(err && err!=-17){console.log(err);return;}
                                                    // console.log('目录创建成功!');
                                                });
                                            }

                                            copyFilePromise(filedir,filedir_new);
                                        }
                                    }
                                    if (isDir && ("_book" != filename))
                                    {
                                        copy_pdf(filedir);
                                    }
                                }
                            })
                        });
                    }
                });
            }
        }
    }
};