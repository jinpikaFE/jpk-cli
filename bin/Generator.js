const ora = require("ora");
const { getRepoList, getTagList } = require("./https");
const inquirer = require("inquirer");
const downloadGitRepo = require("download-git-repo");
const util = require("util");
const path = require("path");

let timer;

class Generator {
  constructor(name, targetDir) {
    // 文件夹名称
    this.name = name;

    // 位置
    this.targetDir = targetDir;

    // 对download-git-repo 进行promise话改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }
  async create() {
    // 1）获取模板名称
    const repo = await this.getRepo();

    // 2) 获取 tag 名称
    const tag = await this.getTag(repo);

    await this.download(repo, tag);
    console.log("模版下载成功！");
    clearTimeout(timer);
  }
  /*
  获取用户选择的模版
    1.远程拉取模版数据
    2.用户选择所要下载的模版名称
    3.return用户选择的名称
  */

  async getRepo() {
    console.log(getRepoList());
    const repoList = await wrapLoading(getRepoList, "获取目标模版中...");
    if (!repoList) return;

    // 筛选指定项目，过滤只要名称
    const repos = repoList.filter((item) => item.name.indexOf("nest") !== -1);

    // 2）用户选择需要下载的模板名称
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: [
        {
          name: "nest-admin",
          value: "nest-admin",
        },
        {
          name: "vite-react-ts-admin",
          value: "vite-react-ts-admin",
        },
        {
          name: "jpk-lowcode-nextst",
          value: "jpk-lowcode-nextst",
        },
        {
          name: "vite-ssr-nest",
          value: "vite-ssr-nest",
        },
        {
          name: "go-bin",
          value: "go_web",
        },
      ],
      message: "请选择一个模版进行创建",
    });

    // 3. return用户选择
    return repo;
  }

  // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）用户选择自己需要下载的 tag
  // 3）return 用户选择的 tag

  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, "waiting fetch tag", repo);
    if (!tags) return;

    // 过滤我们需要的 tag 名称
    const tagsList = tags.map((item) => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: "tag",
      type: "list",
      choices: tagsList,
      message: "请选择一个tag",
    });

    // 3）return 用户选择的 tag
    return tag;
  }

  // 远程下载模版
  async download(repo, tag) {
    // 拼接链接 https://github.com/jinpikaFE/nest-admin/archive/refs/heads/master.zip
    // https://api.github.com/repos/jinpikaFE/nest-admin/zipball/refs/tags/v_mongodb
    const requestUrl = `jinpikaFE/${repo}${tag ? "#" + tag : ""}`;

    // 2min 之后弹出，显示超时
    timer = setTimeout(() => {
      clearTimeout(timer);
      throw "模版下载超时，请重试！";
    }, 1000 * 60 * 10);
    // 调用下载方法，进行远程下载
    await wrapLoading(
      this.downloadGitRepo,
      "正在下载目标模版中...",
      requestUrl,
      path.resolve(process.cwd(), this.targetDir)
    );
  }
}

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // ora初始化，传入提示 message
  const spinner = ora(message);
  // 开始
  spinner.start();
  try {
    // 执行fn
    const result = await fn(...args);
    // 成功
    spinner.succeed();
    return result;
  } catch {
    // 失败
    spinner.fail("请求失败，请重试...");
    return null;
  }
}

module.exports = Generator;
