# js-function-vis


## Data Collection

Use [git](http://git-scm.com/) to clone a repository, then [du](http://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html) to create a tsv with the directory contents. [source](https://github.com/micahstubbs/source-code-treemap-experiments/blob/master/01/README.md)

    git clone git://github.com/mbostock/d3.git
    (echo -n 'size\tfile\n'; du -a drift) > js-function-vis/drift.tsv

