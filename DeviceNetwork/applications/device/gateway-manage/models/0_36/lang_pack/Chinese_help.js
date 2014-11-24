var help = new Object();
ui.help="欢迎使用！";
menu.system="设置系统参数";
menu.network="设置网络参数";
menu.services="设置系统服务参数";
menu.fw="设置防火墙参数";
menu.tools="系统/网络工具";
menu.stat="查看系统/网络状态";

menu.setup_system="<li>界面语言：可选择操作界面的语言，注意控制台、WEB等管理方式的界面都将相应修改；</li><li>路由器名称：为路由器起一个名字，可以是任意字符（1~32个英文字符或1~16个中文字符）；</li><li>主机名：设置路由器的主机名，请输入英文字符（1~32个英文字符）；</li>";
menu.setup_time="<li>路由器时间: 显示当前路由器的时间;</li><li>主机时间: 显示PC主机的时间;</li><li>时区：选择路由器所在的时区；</li><li>自动设置夏令时：在某些时区自动设置夏令时；</li><li>设置时区字符串：手动设置时区；</li><li>自动更新时间：通过网络时间服务器自动更新路由器时间；</li><li>网络时间服务器：设置网络时间服务器的地址，最多可设置3个</li>";
menu.setup_com="<li>设置串口参数，这些参数影响控制台管理和DTU服务等功能。</li>";
menu.admin_access="<li>用户名：管理路由器的用户名；</li><li>密码：登录密码</li><li>确认密码：再次输入登录密码</li><li>管理功能：设置路由器的管理方式，可同时启用多种管理方式，并可以限制指定管理方式的管理端口、是否允许本地（通过LAN口）和远程（通过WAN口）管理、允许远程管理的IP地址范围（可通过类似192.168.0.1-192.168.0.100或192.168.0.0/24等方式指定）等</li><li>登录超时: 设置用户登录超时时间.如果期间没有操作,就会退出登录.这个时间会影响上面所有说的所有登录方式.</li>";
menu.admin_log="<li>发送到远程日志服务器：是否发送路由器日志到远程日志服务器；</li><li>日志服务器的地址/端口：指定日志服务器的IP地址和端口</li>";
menu.admin_config="<li>Router配置: 点击'浏览'选择一个路由器的配置,然后点击'导入'则完成导入配置的操作; 点击'备份'则完成导出路由器当前配置的操作;点击'恢复出厂设置'则恢复路由器的出厂设置.</li><li>网络运营商(ISP): 导入一个新的运营商列表,和备份路由器的当前列表. 该列表由路由器提供商提供.</li>";
menu.upgrd="<li>选择一个路由器固件文件，升级路由器</li>";
menu.about="<li>访问<a href='http://www.inhand.com.cn'>www.inhand.com.cn</a>获取更多产品信息</li>";
menu.setup_lan0="<li>MAC地址：设置端口的MAC地址，可通过点击“默认值”按钮恢复为出厂设置；</li><li>IP地址：设置端口的IP地址；</li><li>子网掩码：设置端口的子网掩码；</li><li>MTU：设置端口的MTU（最大传输单元）值，建议采用默认值；</li><li>探测主机: 设置探测主机的IP，当路由器与该主机的链路不通将重新启动网络接口;</li><li>多IP支持：可以为LAN端口设置多个IP地址；</li>";
menu.setup_wan0="<li>类型：选择端口的连接方式；</li><li>共享连接：是否允许LAN端口通过WAN端口的IP地址访问外部网络，除了某些特殊的路由模式应用这里都应该选择开启；</li><li>MAC地址：设置端口的MAC地址，可通过点击“默认值”按钮恢复为出厂设置；</li><li>IP地址：设置静态IP的连接方式时端口的IP地址；</li><li>子网掩码：设置静态IP的连接方式时端口的子网掩码；</li><li>网关：设置静态IP的连接方式时端口的网关；</li><li>MTU：设置端口的MTU（最大传输单元）值，建议采用默认值；</li><li>多IP支持：采用静态IP的连接方式时可以为端口设置多个IP地址；</li><li>ADSL拨号设置：采用ADSL拨号的连接方式时需要设置用户名、密码等参数，并可以设置连接检测等功能</li>";
menu.setup_wan1="<li>启用: 是否启用拨号端口；</li><li>共享连接: 是否允许LAN端口通过拨号端口的IP地址访问外部网络，除了某些特殊的路由模式应用这里都应该选择开启；</li><li>Modem类型: 选择当前使用的上网卡,内置模块的无需设置此项;</li><li>网络运营商(ISP): 选择当前的网络运营商.如果运营商不在该列表,请选择'定制'选项来设置相应的网络参数(包括网络类型,APN,拨号号码,用户名以及密码).</li><li>网络选择方式: 设置选择2G或3G网络;</li><li>静态IP：拨号时是否使用静态IP地址，如果是可指定（注意：一般情况下拨号均为动态IP）；</li><li>连接方式：选择拨号的方式，可以选择永远在线、按需拨号或手工拨号；</li><li>最大空闲时间：设置多长时间没有数据时自动挂断连接，设置为0表示不挂断；</li><li>重拨间隔：设置拨号断开后间隔多长时间重拨.</li>";
menu.setup_dns="<li>首选域名服务器：设置主域名服务器；</li><li>备选域名服务器：选择备用的域名服务器</li>";
menu.setup_ddns="<li>为WAN端口和拨号端口指定动态域名，每个接口可以各分配一个动态域名。</li><li>当前地址：端口当前的IP地址；</li><li>服务类型：选择一种服务类型；</li><li>URL：更新时请求的URL地址；</li><li>用户名：更新帐号；</li><li>密码：更新密码；</li><li>主机名：分配的动态域名</li><li>通配符：是否使用通配符；</li><li>MX和备份MX：是否更新邮箱记录；</li><li>强制更新：修改设置后强制更新记录；</li><li>上一次更新：上一次更新的时间；</li><li>上一次回应：上一次更新域名时域名服务器的回应消息；</li>";
menu.route_static="<li>设置静态路由表，可设置指定目的网络和子网掩码对应的网关，并附加到指定的接口上<li>";
menu.service_dhcpd="<li>启用DHCP：是否在LAN端口开启DHCP服务；</li><li>起始、结束：DHCP服务可用于分配的IP地址段，注意必须位于LAN端口的子网内；</li><li>有效期：分配给DHCP客户端的地址可供使用的时间；</li><li>DNS: 显示路由器当前的DNS</li><li>Windows名称服务器：一般不用设置；</li><li>静态指定DHCP分配：可为指定的MAC地址或主机每次都分配相同的IP地址；</li>";
menu.service_dnsrelay="<li>DNS转发服务用于为局域网内的计算机提供DNS解析服务，开启后局域网内的计算机只需要指定路由器的内网地址作为DNS服务器即可；</li><li>启用DNS转发服务：是否在LAN端口开启DNS转发服务；</li><li>指定[IP地址 <=> 域名]对：可把指定的域名解析为指定的IP地址；</li>";
menu.service_gps="<li>路由器提供外接串口GPS功能.</li>";
menu.service_ovdp="";
menu.service_vrrpd="";
menu.service_dtu="<li>DTU服务用于提供路由器串口与TCP/UDP协议之间的协议转换；</li><li>启用：是否启用DTU服务；</li><li>工作模式：DTU可工作在服务器或客户端两种模式；</li><li>协议：选择串口数据转为为TCP还是UDP协议；</li><li>服务器：工作在客户端模式时需要指定服务器的IP地址或域名；</li><li>端口：服务端口</li>";
menu.fw_basic="<li>过滤来自Internet的PING探测：是否禁止来自WAN端口的PING探测请求；</li><li>过滤多播：是否过滤多播请求；</li><li>防范DoS攻击：是否开启防范DoS（拒绝服务）攻击；</li>";
menu.fw_acl="<li>设置防火墙过滤规则：</li><li>采用严格策略：选中时表示只要不符合访问控制列表的数据包一律阻止，否则表示只要不符合访问控制列表的数据包一律放行；</li><li>访问控制列表：可对来自指定地址和端口、去往指定位置的数据包进行阻止或放行，并可以记录日志；</li>";
menu.fw_portmap="<li>设置防火墙端口映射规则：</li><li>端口映射列表：可对来自指定地址访问服务端口的数据映射到指定的内部地址和端口，并可以记录日志；</li>";
menu.fw_dmz="<li>DMZ主机通常用于局域网内的计算机对外网提供服务；</li><li>启用 DMZ：是否启用DMZ主机；</li><li>DMZ主机：设置DMZ主机的IP地址，该地址必须位于局域网内，无法映射路由器正占用的端口；</li><li>来源地址范围：允许外部网络访问的地址范围；</li>";
menu.fw_mac="<li>设置防火墙MAC-IP地址绑定规则，该功能用于限定局域网内的指定计算机采用指定的IP地址；</li><li>MAC-IP 绑定列表：输入指定计算机的MAC地址和它对应的IP地址；</li>";
menu.ipsec_basic="<li>启用NAT穿越: 为了防止NAT路由器对IPSec隧道的影响,推荐启用NATT</li><li>维持NAT穿越的间隔时间: 通过设置该值来防止网络中的NAT路由器断开IPSec隧道</li><li>启用数据压缩</li><li>启用调试模式: 用于获得IPSec的调试信息</li><li>强制NATT: 所有数据包都进行NATT</li>";
menu.ipsec_tunnels="";
menu.cert_mgr="";
menu.tools_ping="<li>PING探测工具用于探测指定的主机是否存活，注意如果该主机设置了防火墙规则或者通往该主机的网络路径上存在防火墙可能导致结果不正确；</li><li>主机：要探测的主机地址；</li><li>次数：探测次数；</li><li>包大小：探测包的大小；</li>";
menu.tools_trace="<li>路由探测工具用于探测到达主机所需要经过的路由，注意如果该主机设置了防火墙规则或者通往该主机的网络路径上存在防火墙可能导致结果不正确；</li><li>主机：要探测的主机地址；</li><li>最大跳数：最多经过多少级路由器；</li><li>超时时间；每一次探测的超时时间；</li><li>协议：用于探测的协议，一般使用UDP协议，也可以选择使用ICMP协议</li>";
menu.status_system="<li>显示系统状态信息</li>";
menu.status_modem="<li>显示Modem状态信息</li>";
menu.status_networks="<li>显示网络接口状态信息</li>";
menu.status_route="<li>显示路由表信息</li>";
menu.status_devices="<li>显示当前连接到路由器的设备的信息</li>";
menu.status_dhcpd="<li>显示DHCP服务的运行状态</li>";
menu.status_log="<li>下载系统诊断记录: 当用户遇到困难时,可以下载系统诊断记录,把它发给技术支持,技术支持会第一时间解决用户的困难.</li>";

menu.template="<li></li><li></li><li></li>";