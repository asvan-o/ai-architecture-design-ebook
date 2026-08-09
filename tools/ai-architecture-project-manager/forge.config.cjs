module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'DesignProjectAutoOrganizer',
    ignore: [
      /^\/out($|\/)/,
      /^\/tests($|\/)/,
      /^\/검사($|\/)/,
      /^\/기능($|\/)/,
      /^\/화면($|\/)/,
      /^\/server\.mjs$/,
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'DesignProjectAutoOrganizer',
        authors: 'AI 건축디자인 바이블',
        description: '설계 프로젝트 자동 정리 프로그램',
        setupExe: 'Design Project Auto Organizer Setup.exe',
        noMsi: true,
      },
    },
  ],
};
