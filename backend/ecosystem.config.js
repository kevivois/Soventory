module.exports = {
    apps:[
        {
            name:"api",
            script:"api/setupApi.ts",
            automation:false,
            exec_mode:"cluster",
            env: {
                PORT:3001,
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
}