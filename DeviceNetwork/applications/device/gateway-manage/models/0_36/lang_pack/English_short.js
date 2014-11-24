var help = new Object();
menu.system="Configurate System Parameters.";
menu.network="Configurate Network Parameters.";
menu.services="Configurate System Serivces Parameters.";
menu.fw="Configurate Firewall Parameters.";
menu.tools="System/Network Tools.";
menu.stat="Examine System/Network Status.";

menu.setup_system="Configurate language,router-name,hostname.";
ui.langu="English or Chinese.";
ui.rname="Arbitrariness.";
ui.hname="Arbitrariness.";
menu.setup_com="Configurate com Parameters.";
serial.all="format: [Baudrate Databit Odd-even-check Stopbit]. Baudrate:2400--230400; Databit: 6,7,8; Odd-even-check: N, O, E; Stopbit: 1 or 2.";
serial.hw_flow="1 -- open hardware flow control; 0 -- close hardware flow control.";
serial.sw_flow="1 -- open software flow control; 0 -- close software flow control.";
menu.admin_access="Set username and password.";
ui.username="username.";
ui.old_password="Input old password.";
ui.new_password="Input new password.";
ui.confm_pw="Input new password again.";

menu.admin="set management methods of router.";
ui.enable="1 - enable; 0 - disable.";
menu.admin_config="Export,Import configuration; recover router default configuration.";
ui.exports="Export router current configuration.";
ui.imports="Import a backup configuration for router.";
menu.setup_lan0="set parameters of LAN.";
ui.mac="set MAC address of LAN.";
ui.ip="set IP address of LAN.";
ui.netmask="set netmask of LAN.";
ui.mtu="set MTU of LAN, Default value is perfered.";

ui.lease="Uint is minute";

info.impt_index="Paste system config here(if Press 5 times Enter, Quit!):";
info.impt_done="Import config file successfully!";
info.impt_cofm="Are you sure import Configuaretion?(y/n)";
info.impt_cancel="Cancel import";
info.enter="Press Enter key to continue...";
info.confirm_y="Press Enter to ";
info.confirm_n="Press other key to back.";
info.cancel="Operations have been canceled.";
info.quit="Quit Console";
info.restore="Restore";
info.apply="Settings have saved";
info.langu="Language setting have been revised. Should re-login! Press Enter key to exit console!";
info.restoresuccess="Restore default config successful. Please reboot system!";
info.restorefail="Restore default config fail!";
errmsg.pw_error="Old password error";
errmsg.pw_match="Passwords do not match.Please try again.";

var con = new Object();
var dtl = new Object();
con.motd="Welcome to Router console";
con.confm="are you sure to %s?";
con.bad_cmd="command is not supported!";
con.bad_args="invalid input detected at '^' marker.";
con.more_args="incomplete arguments!";
con.rbooting="rebooting system...";
con.input_pass="input password: ";
con.end="quit current view";
con.dtl="quit current view";
con.supr="change view";
con.supr="change to given view";
con.help="get help for commands";
dtl.help="input help <cmd> to get help for <cmd>";
con.nvram="get/set nvram variables";
dtl.help="get <var> -- get value of var; set <var> <value> -- set value of var; unset <var> -- clear var";
con.service="start/stop service",
dtl.service="start <service> -- start a service; stop <service> -- stop a service; restart <service> -- restart a service",
con.show="show status";
dtl.show="version -- system version; startup-config -- show system startup config; running-config -- show running config; interface -- show interface status; ip -- show network status; system -- show system status; network -- show network status";
con.exit="exit the console";
dtl.exit="";
con.rboot="reboot system";
dtl.rboot="";
con.hst="set hostname";
dtl.hst=" -- show hostname; <hostname> -- set hostname";
con.usr="set username/password";
dtl.usr=" -- show username; <username> -- set uesrname; <username> password <password> -- set username and password";
con.pass="set password";
dtl.pass="<password> -- set password";
con.ping="ping a remote host";
dtl.ping="<hostname> -- ping <hostname>";
con.telnet="telnet a remote host";
dtl.telnet="<hostname> -- telnet to <hostname>";
con.trace="trace route";
dtl.trace="<hostname> -- trace route to <hostname>";