#!/usr/bin/env bash
# Render build script for GymGenie AI backend

set -o errexit

cd backend
pip install --upgrade pip
pip install -r requirements.txt
