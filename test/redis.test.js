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

describe.skip("set", () =>{
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

describe.skip("sorted set",  () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("names"); 
        await redis.quit();
    });

    it("should support sorted set", async() => {
        await redis.zadd("names", 100,"Fajar");
        await redis.zadd("names", 95,"Entong");
        await redis.zadd("names", 90,"Joko");

        expect(await redis.zcard("names")).toBe(3);
        const names=await redis.zrange("names",0,-1);
        expect(names).toEqual(["Joko","Entong","Fajar"]);

        expect(await redis.zpopmax("names")).toEqual(["Fajar", "100"]);
        expect(await redis.zpopmax("names")).toEqual(["Entong", "95"]);
        expect(await redis.zpopmax("names")).toEqual(["Joko", "90"]);
        
        await redis.del("names");
    });
});

describe.skip("hash",  () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("user:1"); 
        await redis.quit();
    });

    it("should support hash", async() => {
        await redis.hset("user:1", {
            "id" : "1",
            "name" : "fajar",
            "email" : "fajar@gmail.com"
        });

        const user=await redis.hgetall("user:1");


        expect(user).toEqual({
            "id" : "1",
            "name" : "fajar",
            "email" : "fajar@gmail.com"
        });
    });
});

describe.skip("geo point",  () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("sellers");
        await redis.quit();
    });

    it("should support geo point", async() => {
        await redis.geoadd("sellers",  106.822673, -6.177616, "Toko A");
        await redis.geoadd("sellers",  106.820646, -6.175366, "Toko B");

        const distance=await redis.geodist("sellers","Toko A","Toko B", "KM");
        expect(distance).toBe(String(0.3361));

        const result=await redis.geosearch("sellers","fromlonlat",  106.822443, -6.176966, "byradius", 5, "KM");
        expect(result).toEqual(["Toko A", "Toko B"]);
    });
});

describe.skip("hyper log log",  () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("visitors");
        await redis.quit();
    });

    it("should support geo point", async() => {
        await redis.pfadd("visitors","fajar","rama","entong");
        await redis.pfadd("visitors","fajar","mulyono","joko");
        await redis.pfadd("visitors","rully","mulyono","joko", "budie tolol","jokowi tolol");

        const total=await redis.pfcount("visitors");
        expect(total).toBe(8);
    });
});

describe("pipeline",  () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("name");
        await redis.del("address");
        await redis.quit();
    });

    it("should support pipeline", async() => {
      const pipelie=redis.pipeline();
      pipelie.setex("name",2,"Fajar");
      pipelie.setex("address",2,"Indonesia");

      await pipelie.exec();

      expect(await redis.get("name")).toBe("Fajar");
      expect(await redis.get("address")).toBe("Indonesia");
    });
});