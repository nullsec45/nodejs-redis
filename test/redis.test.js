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

describe.skip("pipeline",  () => {
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

describe.skip("transaction", () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        await redis.del("name");
        await redis.del("address");
        await redis.quit();
    });

    it("sholud support transaction", async() => {
        const transaction=redis.multi();

        transaction.setex("name", 10, "Fajar");
        transaction.setex("address", 10, "Indonesia");

        await transaction.exec();
    });
});

describe.skip("stream", () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        // await redis.del("members");

        await redis.quit();
    });

    it("sholud support publish to stream", async() => {
        for(let i=0;i<10;i++){
            await redis.xadd("members","*","name",`Fajar ${i} `, "address","Indonesia");
        }
    });

    it("should support consumer group stream", async() => {
        await redis.xgroup("CREATE","members","group-1","0");
        await redis.xgroup("CREATECONSUMER","members","group-1","consumer-1");
        await redis.xgroup("CREATECONSUMER","members","group-1","consumer-2");
    });

    it("should can consume create", async () => {
        const result=await redis.xreadgroup("GROUP", "group-1","consumer-1","COUNT", 2, "BLOCK", 3000, "STREAMS","members",">");
        expect(result).not.toBeNull();

        console.info(JSON.stringify(result,null,2));

    })
});

describe("pubsub", () => {
    let redis=null;

    beforeEach(async() => {
        redis=_initialRedis()
    });

    afterEach(async() => {
        // await redis.del("members");

        await redis.quit();
    });

    it("should can subcribe pubsub", async() => {
        redis.subscribe("channel-1");
        redis.on("message", (channel, message) => {
            console.info(`Receive message from channel ${channel} with message ${message}`);
        });

        // wait 60 seconds
        // await new Promise(resolve => setTimeout(resolve, 3000));
    });

    it("should can publish to pubsub", async() => {
        for(let i=0;i < 10;i++){
            await redis.publish("channel-1", `Hello World ${i}`);
        }
    })
});
