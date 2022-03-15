const fs = require('fs');
const docsPath = __dirname+"/"
const blacklist = [
    '_sidebar.md',
    'img',
    "CNAME","README.md","node_modules",'dist'
]
function getContent(_path,_dir="/"){
    let fsResult = (fs.readdirSync(_path)).filter(item=>!((/^\.+.*/).test(item)))
    fsResult = fsResult.filter(item => blacklist.indexOf(item)<0)
    fsResult.sort((a, b) => {return a - b})
    let result = {}
    for (const i in fsResult) {
        let item = fsResult[i]
        let title = getTitle(_path+"/"+item,item)
        if(fs.lstatSync(_path+"/"+item).isDirectory()){
            result[title] = (getContent(_path+"/"+item,item))
        }else if (/.*\.md$/.test(item)){
            let mdPath = (_path.replace(docsPath,"")+"/"+item)
                .replace(/\s/g, '%20')
                .replace(/\?/g, '%3F')
                .replace(/\)/g, '%29')
                .replace(/#/g, '%23')
            if (mdPath.indexOf('/')==0){
                mdPath = mdPath.slice(1)
            }
            result[title] = mdPath
        }
    }
    return result
}
function generateSidebar(obj,_dir,tab){
    let temp = ""
    if (_dir){
        temp = tab+"- "+_dir+"\n"
        tab+="  "
    }
    for (const key in obj) {
        let item = obj[key]
        if (typeof item == "string"){
            temp += tab+"- ["+key+"]("+item+")\n"
        }else if (typeof item == "object"){
            temp += generateSidebar(item,key,tab)
        }
    }
    return temp
}
function getTitle(path,md) {
    //默认用文件名做标题
    let title = md.substr(0,md.length-3)
    if (md.toLowerCase()=="readme.md"){
        //readme文件用根目录表示
        title =  "README"
    }else if (md.indexOf('.md')<1) {
        //非md文件
        title = md
    }else {
        let data = fs.readFileSync(path, 'utf8').split("\n")
        for (const i in data) {
            if(/^(\s*#){1}\s+.*/.test(data[i])) title=data[i].replace(/^(\s*#){1}\s+/,"");break
        }
    }
    return title
}
let md = generateSidebar(getContent(docsPath,"/"),"","")
fs.writeFile(docsPath+'/_sidebar.md', md, { encoding: 'utf8' }, err => {  });
console.log("\n目录:\n")
console.log(md)