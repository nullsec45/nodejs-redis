import Redis from "ioredis";
require('dotenv').config();

const _initialRedis= () => {
    return new Redis({
            host:process.env.HOST,
            port:process.env.PORT,
            db:process.env.DB,
            username:process.env.username,
            password:process.env.password
    });
}
 
describe("connect to redis server", () => {
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

describe("string", () => {
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