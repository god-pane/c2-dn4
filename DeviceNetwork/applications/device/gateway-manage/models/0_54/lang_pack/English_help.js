var help = new Object();
ui.help="Welcome to use!";
menu.system="Configurate System Parameters";
menu.network="Configurate Network Parameters";
menu.services="Configurate System Services Parameters";
menu.fw="Configurate Firewall Parameters";
menu.tools="System/Network Tools";
menu.stat="Examine System/Network Status";

menu.setup_system="<li>Language: Select config language. Console, WEB and other management methods would be revised accordingly.</li><li>Router Name: A name for router, can contain arbitrary character(1-32 English characters or 1-16 Chinese characters).</li><li>Hostname: Setting up the router hostname, which can only contain English character(1-32 English characters).</li>";
menu.setup_time="<li>Router Time: Show current time of router.</li><li>PC Time: Show current time of PC.</li><li>Timezone: Choose local TZ of router.</li><li>Auto Set Daylight-Saving-Time: Auto set daylight saving time in some TZ.</li><li>Custom TZ String: Manually custom TZ.</li><li>Auto Update Time: Update automatically router time through NTP.</li><li>NTP Time Servers: Set up network time server address(maximum to 3).</li>";
menu.setup_com="<li>Configurate Serial Parameters, and these will affect console management, DTU service and GPS service.</li>";
menu.admin_access="<li>Username: manage username of router.</li><li>Old Password: Enter the current login password.</li><li>New Password: Enter the new login password</li><li>Confirm New Password: Input login password again.</li><li>Management: Configurate management methods. Router can be using multiple management methods simultaneously.</li><li>Login timeout: Set user login timeout.If no operation happens in this period, intferface will be logout. This will affect all management  methods mentioned above.</li>";
menu.admin_log="<li>Log to Remote System: Select whether sending router logs to the remote log server.</li><li>IP Address/Port: Designate IP address and port of log server.</li>";
menu.admin_config="<li>Router Configuration: Click 'Import' to import a backup configuration of router. Click 'Backup' to backup current configuration of router. Restore default configuration: Restore default configuration of router.<li>Network Provider(ISP): Click 'Import' to import an ISP list. Click 'Backup' to backup current ISP list of router. This list is provided by router vendor.</li>";
menu.upgrd="<li>Upgrate router using a firmware file.</li>";
menu.about="<li>Visit <a href='http://www.inhand.com.cn'>www.inhand.com.cn</a> for more products information.</li>";
menu.setup_wan1="<li>Enable: Use Dialup or not.</li><li>Shared Connection: Allow devices to access internet according router.</li><li>Network Provider(ISP): Select mobile network. If your mobile network is not contained in this list, please choose 'Custom' to enter Network Type,APN,Access Number,Username,Password providing by Network Provider.</li>";
menu.setup_wan0="<li>Type: Select method of connection.</li><li>Shared Connection: Allow devices to access internet according router.</li><li>Mutil-IP settings: If using static IP, let WAN port own multiple different IP.</li><li>MTU: set MTU size.</li><li>ADSL Dialup(PPPoE)Settings: If using ADSL, make sure the username and password have been entered correctly.</li>";
menu.setup_lan0="<li>Set basic parameters of LAN port.</li><li>Mutil-IP settings: let LAN port own multiple different IP.</li>";
menu.setup_dns="<li>Set DNS of router.</li><li>Primary DNS: Enter the IP address of your network's Primary DNS server.</li><li>Secondary DNS: Enter the IP address of your network's Secondary DNS server.</li>";
menu.setup_ddns="";
menu.route_static="<li>Set static route table of router.</li>";

menu.service_dhcpd="<li>Enable DHCP: Enable or Disable DHCP service(Default is Enable).</li><li>IP Pool Starting Address: Enter the start of the IP pool range</li><li>IP Pool Ending Address: Enter the end of the IP pool range</li><li>Lease: Enter lease time of IP address</li><li>WINS: Enter the IP address of your network's WINS server.</li><li>Static DHCP: Designate IP according MAC address.</li>";
menu.service_dnsrelay="<li></li>";
menu.service_gps="<li>Display router current position.</li>";
menu.service_ovdp="";
menu.service_vrrpd="";
menu.service_dtu="";

menu.fw_basic="<li></li>";
menu.fw_acl="";
menu.fw_portmap="<li>Portmap(virtual server)</li>";
menu.fw_vip="";
menu.fw_dmz="<li>DMZ Host: Enter the LAN IP address of Computer you wish to set as DMZ host.</li>";
menu.fw_mac="<li>If Default Policy is Block, only devices which bound MAC-IP can connect Internet.</li>";

menu.qos_settings="";

menu.ipsec_basic="<li>Enable NAT-Traversal: Recommend enabling NATT for traversal NAT router.</li><li>Keep alive time interval of NATT: According set this value to avoid disconnection of IPSec tunnel by NAT router.</li><li>Enable compression: Enable Compression of IPSec.</li><li>Debug: Enable Debug for attaining IPSec debug information</li><li>Force NATT: Force all data using NATT</li>";
menu.ipsec_tunnels="";
menu.cert_mgr="";

menu.tools_ping="";
menu.tools_trace="<li></li><li>Host </li><li>Maximum Hops </li><li>Timeout </li><li>Protocol: UDP or ICMP. UDP is used generally. </li>";

menu.status_system="<li>Display system info.</li><li>Sync Time: synchronize router time with PC</li>";
menu.status_modem="<li>Display status of Modem.</li>"
menu.status_networks="<li>Display status of network interfaces.</li>";
menu.status_route="<li>Display router table info.</li>";
menu.status_devices="<li>Display devices connecting to router.</li>";
menu.status_dhcpd="<li>Display running status of DHCP server.</li>";
menu.status_log="<li>Display system log.</li>";

menu.template="<li></li><li></li><li></li>";
