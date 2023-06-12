const tcp = require('./lib/tcp')
const map = require('./lib/map')
class slmodbus{
    constructor(args){
        this.host=args.host || "127.0.0.1",
        this.port=args.port || 502
        this.init()
    }
    init(){
        this.socket=new tcp({
            host:this.host,
            port:this.port
        })
    }
    //读取风机状态
    async readFan() {
        const bit = map.fan.read
        const r = await this.socket.readHoldRegs(bit)
        const fan_status=[]
        fan_status.x0 = r[9]&0x01;
        fan_status.x1 = r[9]&0x02;
        fan_status.x2 = r[9]&0x04;
        fan_status.x3 = r[9]&0x08;
        fan_status.x4 = r[9]&0x10;
        fan_status.x5 = r[9]&0x20;
        fan_status.x6 = r[9]&0x40;
        fan_status.x7 = r[9]&0x80;
        fan_status.x10 = r[10]&0x01;
        if(fan_status.x10>0) return -1;
        if(fan_status.x2>0||fan_status.x3>0) return 1
        return 0
    }
    //判断风机是否允许再次发送命令
    async readFanM() {
        const bit = map.fan.m
        const r = await this.socket.readHoldRegs(bit)
        const m100 = r[9]&0x01;
        if(m100!=0) return false;
        return true
    }
    //控制风机
    async writeFan(addr='D1',status=0) {
        const rbit = map.fan.read
        const r = await this.socket.readHoldRegs(rbit)
        const x0 = r[9]&0x01;
        if(x0>0) return -1;//就地
        const m = await readFanM()
        if(!m) return -2;//前一次命令执行未结束
        const wbit = map.fan.write[addr][status]
        return await this.socket.readHoldRegs(wbit)
    }
    //读取照明状态
    async readLight() {
        const bit = map.light.read
        const r = await this.socket.readHoldRegs(bit)
        const right=[]
        right.x20 = r[11]&0x01;
        right.x21 = r[11]&0x02;
        right.x22 = r[11]&0x04;
        right.x23 = r[11]&0x08;
        right.x24 = r[11]&0x10;
        right.x25 = r[11]&0x20;
        right.x26 = r[11]&0x40;
        right.x27 = r[11]&0x80;
        right.x30 = r[12]&0x01;
        return right
    }
    //读取照明状态
    async writeLight(addr='M1',status=0) {
        const bit = map.light.write[addr][status]
        return await this.socket.readHoldRegs(bit)
    }
    //读取信号灯是否远控
    async readLane() {
        const bit = map.lane.read
        const r = await this.socket.readHoldRegs(bit)
        const status = r[9]&0x01;
        return status
    }
    //控制信号灯
    async writeLane(addr,status) {
        const bit = map.lane.write[addr][status]
        return await this.socket.readHoldRegs(bit)
    }
    //控制信号灯
    async readCOVI() {
        const bit = map.COVI.read
        const r = await this.socket.readHoldRegs(bit)
        const status = r[9]&0x01;
        return status
    }
    async readSW() {
        const bit = map.SW.read
        const r = await this.socket.readHoldRegs(bit)
        const status = r[9]&0x01;
        return status
    }
    bytesToBinary(bytes) {
        const length = bytes.length;
        let result = '';
        for (let i = 0; i < length; i++) {
            const binStr = Number(bytes[i]).toString(2)
            result +=  '0'.repeat(8 - binStr.length) + binStr; // 不足八位前置补0
        }
        return result.toString();
    }
    close = async()=>{
        this.socket.close()
    }
}
module.exports=slmodbus