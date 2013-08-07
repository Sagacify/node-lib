#!/bin/bash

mongodump --host ec2-46-137-39-109.eu-west-1.compute.amazonaws.com:27017 --db i4_prod --out ~/Dropbox/SAGACIFY/Backups/i4_prod.dump

#mongodump --host ec2-46-137-39-109.eu-west-1.compute.amazonaws.com:27017 --db bw_prod --out ~/Dropbox/SAGACIFY/Backups/bw_prod.dump
