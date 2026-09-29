window.ITCYBER_SUPABASE={
  url:"https://bvygcyllsdkqxjvdlrno.supabase.co",
  key:"sb_publishable_l5S-OcPaxVMJ2EvZAVDGLw_l3bwIvtT"
};
window.itcyberDb=window.supabase.createClient(window.ITCYBER_SUPABASE.url,window.ITCYBER_SUPABASE.key,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
