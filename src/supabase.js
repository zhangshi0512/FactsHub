import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wtzibrvrggttathbhrqz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0emlicnZyZ2d0dGF0aGJocnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUzOTA2MDksImV4cCI6MTk5MDk2NjYwOX0.YbgSVjgYzqof6_25Dt-bvKErgYgxE8Sl4Zs5sNdPXi8";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
