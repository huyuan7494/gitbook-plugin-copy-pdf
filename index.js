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
                                            var cmd = 'mkdir -p ' + filePath_new;
                                            cmd = cmd + ';\\cp -f ' + filedir + ' ' + filePath_new;
                                            //console.log(cmd);
                                            exec(cmd, function(error, stdout, stderr)
                                            {
                                                if (error)
                                                {
                                                    console.log(error);
                                                    return;
                                                }
                                            })
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