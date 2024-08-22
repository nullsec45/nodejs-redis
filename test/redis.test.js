import Redis from "ioredis";
require('dotenv').config();

const _initialRedis= () => {
    return new Redis({
            host:process.env.HOST,
            port:process.env.PORT,
            db:process.env.DB,
            username:process.env.USERNAME_REDIS,
            password:process.env.PASSWORD
    });
}
 
describe.skip("connect to redis server", () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.quit();
    });

    it("should can ping", async() => {
        const pong=await redis.ping();
        expect(pong).toBe("PONG");
    });
})

describe.skip("string", () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.quit();
    });

    it("should support string", async() => {
        await redis.setex("name",2,"fajar");
        let name=await redis.get("name");
        expect(name).toBe("fajar");

        await new Promise(resolve => setTimeout(resolve, 3000));
        name=await redis.get("name");
        expect(name).toBeNull();
    })
})

describe.skip("list", () =>{
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("names"); 
        await redis.quit();
    });

   it("should suppport list", async () => {
        await redis.rpush("names","rama");
        await redis.rpush("names","fajar");

       expect(await redis.llen("names")).toBe(2);

       const names=await redis.lrange("names",0,-1);
       expect(names).toEqual(["rama","fajar"]);

       expect(await redis.lpop("names")).toBe("rama");
       expect(await redis.lpop("names")).toBe("fajar");

       expect(await redis.llen("names")).toBe(0);
   }); 
});

describe("set", () =>{
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("names"); 
        await redis.quit();
    });

   it("should support set", async() => {
        await redis.sadd("names","rama");
        await redis.sadd("names","rama"); 
        await redis.sadd("names","fajar"); 
        await redis.sadd("names","fajar"); 

        expect(await redis.scard("names")).toBe(2);

        const names=await redis.smembers("names");
        expect(names).toEqual(["rama","fajar"]);
   });
});

  