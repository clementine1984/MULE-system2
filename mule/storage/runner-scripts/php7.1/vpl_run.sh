#! /bin/bash
cat > vpl_execution <<EEOOFF
#! /bin/bash

php <% FILENAME %>

EEOOFF

chmod +x vpl_execution