const slmodbus = require('./index')

const sl=new slmodbus({host:'192.168.159.54',port:5001})
const fan1_status=[]
const demo = async()=>{
    const r = await sl.readX()
    console.log(r)
    fan1_status.x0 = r[9]&0x01;
    fan1_status.x1 = r[9]&0x02;
    fan1_status.x2 = r[9]&0x04;
    fan1_status.x3 = r[9]&0x08;
    fan1_status.x4 = r[9]&0x10;
    fan1_status.x5 = r[9]&0x20;
    fan1_status.x6 = r[9]&0x40;
    fan1_status.x7 = r[9]&0x80;
    fan1_status.x10 = r[10]&0x01;
    console.log(fan1_status)
    return fan1_status
}
demo();