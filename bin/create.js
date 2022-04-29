const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const Generator = require('./Generator')

module.exports = async function (name, options) {
  // 检测命名是否允许使用
  // const result = validateProjectName(name)
  // if (!result.validForNewPackages) {
  //   console.log(`Invalid project name: "${name}"`);
  //   return
  // }
  // 获取当前目录
  const cwd = process.cwd()
  // 获取目标文件夹地址
  const targetDir = path.join(cwd, name)
  // 是否已存在文件夹
  if (fs.existsSync(targetDir)) {
    // 是否强制创建(覆盖)
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      let { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: '目录已存在，请选择一项进行操作：',
          choices: [
            {
              name: '覆盖',
              value: 'overwrite'
            }, {
              name: '取消',
              value: false
            }
          ],
        }
      ])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        // 移除已存在的目录
        console.log(`\r\n移除原有文件中...`)
        await fs.remove(targetDir)
      }
    }
  }
  const generator = new Generator(name, targetDir)
  generator.create()

}