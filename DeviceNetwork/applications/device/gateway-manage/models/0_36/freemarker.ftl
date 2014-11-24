#CONFIG BEGIN 

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

<#if (_ddns_setting_enable!="0")>
ddns_domain ${ddns_domain}
ddns_service ${ddns_service}
ddns_account ${ddns_account}
ddns_password ${ddns_password}
</#if>

<#if (_fw_vip_enable!="0")>
fw_local_virtual ${fw_local_virtual}
fw_ipmap_real_1 ${fw_ipmap_real_1}
fw_ipmap_virtual_1 ${fw_ipmap_virtual_1}
fw_ipmap_real_2 ${fw_ipmap_real_2}
fw_ipmap_virtual_2 ${fw_ipmap_virtual_2}
fw_ipmap_real_3 ${fw_ipmap_real_3}
fw_ipmap_virtual_3 ${fw_ipmap_virtual_3}
fw_ipmap_real_4 ${fw_ipmap_real_4}
fw_ipmap_virtual_4 ${fw_ipmap_virtual_4}
fw_ipmap_real_5 ${fw_ipmap_real_5}
fw_ipmap_virtual_5 ${fw_ipmap_virtual_5}
fw_ipmap_real_6 ${fw_ipmap_real_6}
fw_ipmap_virtual_6 ${fw_ipmap_virtual_6}
fw_ipmap_real_7 ${fw_ipmap_real_7}
fw_ipmap_virtual_7 ${fw_ipmap_virtual_7}
fw_ipmap_real_8 ${fw_ipmap_real_8}
fw_ipmap_virtual_8 ${fw_ipmap_virtual_8}
fw_ipmap_real_9 ${fw_ipmap_real_9}
fw_ipmap_virtual_9 ${fw_ipmap_virtual_9}
fw_ipmap_real_10 ${fw_ipmap_real_10}
fw_ipmap_virtual_10 ${fw_ipmap_virtual_10}
fw_ipmap_real_11 ${fw_ipmap_real_11}
fw_ipmap_virtual_11 ${fw_ipmap_virtual_11}
fw_ipmap_real_12 ${fw_ipmap_real_12}
fw_ipmap_virtual_12 ${fw_ipmap_virtual_12}
fw_ipmap_real_13 ${fw_ipmap_real_13}
fw_ipmap_virtual_13 ${fw_ipmap_virtual_13}
fw_ipmap_real_14 ${fw_ipmap_real_14}
fw_ipmap_virtual_14 ${fw_ipmap_virtual_14}
fw_ipmap_real_15 ${fw_ipmap_real_15}
fw_ipmap_virtual_15 ${fw_ipmap_virtual_15}
fw_ipmap_real_16 ${fw_ipmap_real_16}
fw_ipmap_virtual_16 ${fw_ipmap_virtual_16}
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

<#if (_ipsec_basic_enable!="0")>
ipsec_local_subnet ${ipsec_local_subnet}
ipsec_keep_alive_delay ${ipsec_keep_alive_delay}
ipsec_nat_traversal ${ipsec_nat_traversal}
ipsec_debug ${ipsec_debug}
</#if>

<#if (_ipsec_tunnels_enable!="0")>
ipsec_client_on_1 ${ipsec_client_on_1}
ipsec_client_my_id_1 ${ipsec_client_my_id_1}
ipsec_client_peer_id_1 ${ipsec_client_peer_id_1}
ipsec_client_key_1 ${ipsec_client_key_1}
ipsec_client_peer_host_1 ${ipsec_client_peer_host_1}
ipsec_client_peer_subnet_1 ${ipsec_client_peer_subnet_1}
ipsec_client_init_1 ${ipsec_client_init_1}
ipsec_client_sys_1 ${ipsec_client_sys_1}
ipsec_client_pfs_1 ${ipsec_client_pfs_1}
ipsec_client_pfsgrp_1 ${ipsec_client_pfsgrp_1}
ipsec_client_ike_alg_1 ${ipsec_client_ike_alg_1}
ipsec_client_ike_lifetime_1 ${ipsec_client_ike_lifetime_1}
ipsec_client_ipsec_alg_1 ${ipsec_client_ipsec_alg_1}
ipsec_client_ipsec_lifetime_1 ${ipsec_client_ipsec_lifetime_1}
ipsec_client_dpd_delay_1 ${ipsec_client_dpd_delay_1}
ipsec_client_dpd_timeout_1 ${ipsec_client_dpd_timeout_1}
ipsec_client_max_rekey_1 ${ipsec_client_max_rekey_1}
ipsec_client_use_cert_1 ${ipsec_client_use_cert_1}
ipsec_client_keepalive_host_1 ${ipsec_client_keepalive_host_1}
ipsec_client_keepalive_delay_1 ${ipsec_client_keepalive_delay_1}
ipsec_client_keepalive_timeout_1 ${ipsec_client_keepalive_timeout_1}
ipsec_client_keepalive_retries_1 ${ipsec_client_keepalive_retries_1}
</#if>

#CONFIG END
################# EOF FILE ################################


#CONFIG BEGIN

#SCEP setting
<#if (_cert_mgr_enable!="0")>
scep_on ${scep_on}
scep_url ${scep_url}
scep_serial_number ${scep_serial_number}
scep_common_name ${scep_common_name}
scep_FQDN ${scep_FQDN}
scep_organizational_unit_name1 ${scep_organizational_unit_name1}
scep_organizational_unit_name2 ${scep_organizational_unit_name2}
scep_DC1 ${scep_DC1}
scep_DC2 ${scep_DC2}
scep_DC3 ${scep_DC3}
scep_challenge ${scep_challenge}
scep_key_len ${scep_key_len}
scep_key_passwd ${scep_key_passwd}
scep_days_before_invalid ${scep_days_before_invalid}
scep_polling_interval ${scep_polling_interval}
scep_max_polling_time ${scep_max_polling_time}
scep_max_polling_cnt ${scep_max_polling_cnt}
status_enroll_state ${status_enroll_state}
</#if>

#CONFIG END

################# EOF FILE ################################