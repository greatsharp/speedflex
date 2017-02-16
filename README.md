# speedflex
SpeedFlex network speed test

A network speed test tool based on Zap/Zapd

公司的U系统添加了一个小功能，能够测试Master AP和Member AP之间的网络连接速度，也可以测试Client用户设备和所连接的AP之间的网络连接速度。

![image](https://github.com/greatsharp/speedflex/blob/master/speedflex-test1.png)
![image](https://github.com/greatsharp/speedflex/blob/master/speedflex-test2.png)

其实现原理也很简单，在AP或需要测试的设备上运行Zapd，这是一个后台程序.然后运行zap命令，添加需要测试的设备的ip地址作为参数等，如这里测试172.18.133.7和172.18.133.4两个AP的网络速度，测试持续10秒。分析测试输出的343.2mbps就是测试速度。


![image](https://github.com/greatsharp/speedflex/blob/master/speedflex-zap.png)


如果要测试Uplink，就将zap命令里的-s -t参数互换一下就行。

