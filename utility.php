<?php
// Helper functions used throughout the application

require_once './includes.php';

$logfile = './logfile';

function msg($message) {
    global $logfile;
    file_put_contents($logfile, "$message\n", FILE_APPEND);    
}

function var_dump_ret($mixed = null) {
    ob_start();
    var_dump($mixed);
    $content = ob_get_contents();
    ob_end_clean();
    return $content;
  }

function update_tpos() {
    $result_set = getArtistList();  
    //msg(sizeof($result_set));
    $artistset = $result_set[0];
    $currentset = $result_set[1];
    $current = $currentset->{'data'}[1];
    $artistList = $artistset->{'data'};
    
    foreach ($artistList as $artist) {
        $dir = "$current/$artist";
        //msg($dir);
        //$dir = "../music/0Artist";
        $ret_albumset = getAlbumList($dir);
        $albumList = $ret_albumset[0]->{'data'};
        foreach ($albumList as $album) {
            $folder = "$dir/$album";            
            if (file_exists("/0mp3/stop")) {
                msg("Forced exit from: $folder");
                exit;
            }
            msg("Processing: $folder");
            $ret_titleset = getTitleList($folder);
            // msg(json_encode($ret_titleset));
            // return;
            $titleList = $ret_titleset[0]->{'data'};
            // msg(json_encode($titleList));
            // return;           
            foreach ($titleList as $key => $title) {               
                //msg(json_encode($title));
                $acton[0] = 'TRCK';
                $acton[1] = $title->{'TRCK'};
                $acton[2] = "$key";
                //msg($key);
                setTag($acton);                
            }
        }
        // `sleep .5`;        
    }
    
}

?>
