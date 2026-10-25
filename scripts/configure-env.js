const fs = require('node:fs')
const path = require('node:path')

const projectRoot = path.resolve(__dirname, '..')
const envPath = path.join(projectRoot, '.env')
const configPath = path.join(projectRoot, 'app-side', 'config.js')
const zmlPackagePath = path.join(projectRoot, 'node_modules', '@zeppos', 'zml', 'package.json')

if (!fs.existsSync(zmlPackagePath)) {
  throw new Error('Missing @zeppos/zml dependency. Run npm install using the configured Zepp registry before building.')
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (!match || match[1] !== 'GOOGLE_SCRIPT_URL') {
        return env
      }

      let value = match[2]
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      env[match[1]] = value
      return env
    }, {})
}

const envFile = readEnvFile(envPath)
const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL || envFile.GOOGLE_SCRIPT_URL || ''
const isDevMode = process.argv[2] === 'dev'

fs.writeFileSync(
  configPath,
  `export const GOOGLE_SCRIPT_URL = ${JSON.stringify(googleScriptUrl)}\n` +
    `export const IS_DEV_MODE = ${isDevMode}\n`,
  'utf8'
)

console.log('Generated app-side/config.js from GOOGLE_SCRIPT_URL.')
