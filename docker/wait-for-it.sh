#!/bin/bash
# wait-for-it.sh: Wait for a service to be available
# Usage: wait-for-it.sh host:port [-t timeout] [-- command args]

cmdname=$(basename $0)
timeout=15
quiet=0

# Process arguments
while [[ $# -gt 0 ]]
do
  case "$1" in
    *:* )
    hostport=(${1//:/ })
    host=${hostport[0]}
    port=${hostport[1]}
    shift 1
    ;;
    -q | --quiet)
    quiet=1
    shift 1
    ;;
    -t | --timeout)
    timeout="$2"
    if [[ $timeout == "" ]]; then break; fi
    shift 2
    ;;
    --timeout=*)
    timeout="${1#*=}"
    shift 1
    ;;
    --)
    shift
    cli=("$@")
    break
    ;;
    --help)
    echo "Usage: $cmdname host:port [-t timeout] [-- command args]"
    exit 0
    ;;
    *)
    echo "Unknown argument: $1"
    exit 1
    ;;
  esac
done

if [[ "$host" == "" || "$port" == "" ]]; then
  echo "Error: You need to provide a host and port to test."
  exit 1
fi

function wait_for {
  if [[ $quiet -ne 1 ]]; then
    echo "Waiting for $host:$port..."
  fi
  
  for i in `seq $timeout` ; do
    nc -z "$host" "$port" > /dev/null 2>&1
    result=$?
    if [[ $result -eq 0 ]]; then
      if [[ $quiet -ne 1 ]]; then
        echo "$host:$port is available after $i seconds"
      fi
      if [[ -n $cli ]]; then
        exec "${cli[@]}"
      fi
      exit 0
    fi
    sleep 1
  done
  
  echo "Operation timed out" >&2
  exit 1
}

wait_for

# Execute command if given
if [[ -n $cli ]]; then
  exec "${cli[@]}"
fi