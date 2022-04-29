// 远程下载模版
const axios = require("axios");
const { GITHUB_API } = require("./constants");

axios.interceptors.response.use((res) => {
  return res.data;
});

/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios.get(GITHUB_API);
}

/**
 * 获取版本信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function getTagList(repo) {
  return axios.get(`https://api.github.com/repos/jinpikaFE/${repo}/tags`);
}

module.exports = {
  getRepoList,
  getTagList,
};
