#BEGIN-CONFIG TIMESTAMP:
#######################################################################
<#if (_setup_system_enable!="0")>
language=${language}
router_name=${router_name}
hostname=${hostname}
</#if>

<#if (_setup_time_enable!="0")>
tm_sel=${tm_sel}
tm_tz=${tm_tz}
tm_dst=${tm_dst}
ntp_updates=${ntp_updates}
ntp_tdod=${ntp_tdod}
ntp_server=${ntp_server}
</#if>

<#if (_setup_com_enable!="0")>
com1_config=${com1_config}
com1_sw_flow=${com1_sw_flow}
</#if>

<#if (_admin_log_enable!="0")>
log_remote=${log_remote}
log_remoteip=${log_remoteip}
log_remoteport=${log_remoteport}
</#if>

<#if (_admin_access_enable!="0")>
http_enable=${http_enable}
https_enable=${https_enable}
telnet_enable=${telnet_enable}
console_enable=${console_enable}

http_local=${http_local}
https_local=${https_local}
telnet_local=${telnet_local}

http_remote=${http_remote}
https_remote=${https_remote}
telnet_remote=${telnet_remote}

http_port=${http_port}
https_port=${https_port}
telnet_port=${telnet_port}

http_src=${http_src}
https_src=${https_src}
telnet_src=${telnet_src}

http_description=${http_description}
https_description=${https_description}
telnet_description=${telnet_description}
console_description=${console_description}
login_timeout=${login_timeout}
</#if>

<#if (_setup_wan1_enable!="0")>
wan1_proto=${wan1_proto}
wan1_ppp_mode=${wan1_ppp_mode}
wan1_ppp_provider=${wan1_ppp_provider}
wan1_ppp_callno=${wan1_ppp_callno}
wan1_ppp_apn=${wan1_ppp_apn}
wan1_ppp_username=${wan1_ppp_username}
wan1_ppp_passwd=${wan1_ppp_passwd}
wan1_ppp_static=${wan1_ppp_static}
wan1_ppp_ip=${wan1_ppp_ip}
wan1_ppp_peer=${wan1_ppp_peer}
wan1_ppp_check_interval=${wan1_ppp_check_interval}
wan1_ppp_check_retries=${wan1_ppp_check_retries}
wan1_icmp_host=${wan1_icmp_host}
wan1_icmp_interval=${wan1_icmp_interval}
wan1_icmp_timeout=${wan1_icmp_timeout}
wan1_icmp_retries=${wan1_icmp_retries}
wan1_debug=${wan1_debug}
wan1_trig_data=${wan1_trig_data}
wan1_trig_sms=${wan1_trig_sms}
</#if>

<#if (_setup_lan0_enable!="0")>
lan0_ip=${lan0_ip}
lan0_netmask=${lan0_netmask}
lan0_mip=${lan0_mip}
</#if>

<#if (_setup_dns_enable!="0")>
dns_static=${dns_static}
</#if>

<#if (_routes_static_enable!="0")>
routes_static=${routes_static}
</#if>

<#if (_setup_ddns_enable!="0")>
ddnsx0=${ddnsx0}
ddnsx1=${ddnsx1}
</#if>

<#if (_service_ovdp_enable!="0")>
ovdp_mode=${ovdp_mode}
ovdp_vendor_id=${ovdp_vendor_id}
ovdp_device_id=${ovdp_device_id}
ovdp_center=${ovdp_center}
ovdp_center_port=${ovdp_center_port}
ovdp_trust_list=${ovdp_trust_list}
</#if>

<#if (_service_dtu_enable!="0")>
dtu_enable=${dtu_enable}
dtu_server_mode=${dtu_server_mode}
dtu_tcp_mode=${dtu_tcp_mode}
dtu_server=${dtu_server}
dtu_port=${dtu_port}
dtu_id=${dtu_id}
dtu_protocol=${dtu_protocol}
</#if>

<#if (_fw_basic_enable!="0")>
fw_strict=${fw_strict}
fw_block_wan=${fw_block_wan}
fw_anti_dos=${fw_anti_dos}
</#if>

<#if (_fw_acl_enable!="0")>
fw_acl=${fw_acl}
</#if>

<#if (_fw_portmap_enable!="0")>
fw_portmap=${fw_portmap}
</#if>

<#if (_fw_vip_enable!="0")>
fw_router_vip=${fw_router_vip}
fw_vip_range=${fw_vip_range}
fw_vip=${fw_vip}
</#if>

<#if (_fw_dmz_enable!="0")>
dmz_enable=${dmz_enable}
dmz_ip=${dmz_ip}
dmz_src=${dmz_src}
</#if>

<#if (_fw_mac_rules_enable!="0")>
fw_mac_rules=${fw_mac_rules}
</#if>

<#if (_qos_settings_enable!="0")>
qos_enable=${qos_enable}
qos_obw=${qos_obw}
qos_ibw=${qos_ibw}
</#if>

<#if (_ipsec_basic_enable!="0")>
ipsec_natt_enable=${ipsec_natt_enable}
ipsec_natt_interval=${ipsec_natt_interval}
ipsec_uniqueids=${ipsec_uniqueids}
ipsec_compress=${ipsec_compress}
ipsec_debug=${ipsec_debug}
ipsec_force_natt=${ipsec_force_natt}
</#if>

<#if (_ipsec_tunnels_enable!="0")>
ipsec_tunnels=${ipsec_tunnels}
</#if>

<#if (_gre_tunnels_enable!="0")>
gre_tunnels=${gre_tunnels}
</#if>

<#if (_cert_mgr_enable!="0")>
cert_key=${cert_key}
scep_enable=${scep_enable}
scep_challenge=${scep_challenge}
scep_url=${scep_url}
scep_common_name=${scep_common_name}
scep_fqdn=${scep_fqdn}
scep_unit1=${scep_unit1}
scep_unit2=${scep_unit2}
scep_domain=${scep_domain}
scep_serialno=${scep_serialno}
scep_unaddr=${scep_unaddr}
scep_key_len=${scep_key_len}
scep_poll_interval=${scep_poll_interval}
scep_poll_timeout=${scep_poll_timeout}
</#if>

#END-CONFIG CHKSUM: