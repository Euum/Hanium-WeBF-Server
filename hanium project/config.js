module.exports = {
    server_port : 80,
    db_url : 'mongodb://localhost:27017/local',
    db_schemas : 
    [
        {
            file:'./user_schema', 
            collection:'test0', 
            schemaName:'UserSchema', 
            modelName:'UserModel'
        }
    ],   
    route_info :
    [
        {
            file:'./user_route',
            path:'/',
            method:'index',
            type:'get'
        },
        {
            file:'./user_route',
            path:'/process/login',
            method:'login',
            type:'post'
        },
        {
            file:'./user_route',
            path:'/process/adduser',
            method:'adduser',
            type:'post'
        },
        {
            file:'./user_route',
            path:'/process/listuser',
            method:'listuser',
            type:'post'
        },
        {
            file:'./user_route',
            path:'/IDCHECK',
            method:'idCheck',
            type:'get'
        }
    ]

}