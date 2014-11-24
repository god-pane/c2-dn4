#BEGIN-CONFIG TIMESTAMP:
#######################################################################
<#if (_setup_system_enable!="0")>
language ${language}
tzone ${tzone}
hostname ${hostname}
</#if>

<#if (_fw_acl_enable!="0")>
telnet_on ${telnet_on}
telnet_port ${telnet_port}
telnet_from_wan ${telnet_from_wan}
web_on ${web_on}
web_port ${web_port}
web_from_wan ${web_from_wan}
</#if>

<#if (_admin_log_enable!="0")>
log_server_host ${log_server_host}
</#if>

<#if (_setup_lan0_enable!="0")>
local_ip ${local_ip}
local_mask ${local_mask}
</#if>

<#if (_setup_dns_enable!="0")>
dns1 ${dns1}
dns2 ${dns2}
</#if>

<#if (_setup_wan1_enable!="0")>
modem_phone ${modem_phone}
modem_account ${modem_account}
modem_password ${modem_password}
modem_APN ${modem_APN}
modem_detect_interval ${modem_detect_interval}
modem_max_failure ${modem_max_failure}
modem_max_retry ${modem_max_retry}
heartBeat_host ${heartBeat_host}
heartBeat_interval ${heartBeat_interval}
heartBeat_timeout ${heartBeat_timeout}
heartBeat_retries ${heartBeat_retries}
</#if>

<#if (_fw_dmz_enable!="0")>
fw_vserver ${fw_vserver}
</#if>

<#if (_service_ovdp_enable!="0")>
inhand_serialnum ${inhand_serialnum}
on ${on}
vendor_id ${vendor_id}
device_id ${device_id}
center_ip ${center_ip}
center_port ${center_port}
</#if>

#END-CONFIG CHKSUM:0