$ed = Get-Content src\pages\EventDetails.tsx -Raw
$ed = $ed -replace "import React(?:, \{.*?\})? from 'react';", "import { useEffect, useState } from 'react';"
$ed = $ed -replace "\(prev =>", "((prev: any) =>"
$ed = $ed -replace "prev =>", "(prev: any) =>"
$ed = $ed -replace "r =>", "(r: any) =>"
$ed = $ed -replace "v =>", "(v: any) =>"
$ed = $ed -replace "f =>", "(f: any) =>"
$ed = $ed -replace "\(response\)", "(response: any)"
$ed = $ed -replace "field =>", "(field: any) =>"
$ed = $ed -replace "\(field, index\)", "(field: any, index: number)"
Set-Content src\pages\EventDetails.tsx $ed

$me = Get-Content src\pages\ManageEvents.tsx -Raw
$me = $me -replace "import React(?:, \{.*?\})? from 'react';", "import { useState, useEffect } from 'react';"
$me = $me -replace "\(dept\)", "(dept: any)"
$me = $me -replace "e =>", "(e: any) =>"
$me = $me -replace "index =>", "(index: number) =>"
$me = $me -replace "\(event, e\)", "(event: any, e: any)"
$me = $me -replace "\(id, e\)", "(id: string, e: any)"
$me = $me -replace "field =>", "(field: any) =>"
$me = $me -replace "\(idx\)", "(idx: number)"
$me = $me -replace "\(optIndex\)", "(optIndex: number)"
$me = $me -replace "\(field, idx\)", "(field: any, idx: number)"
$me = $me -replace "options: never", "options: any"
Set-Content src\pages\ManageEvents.tsx $me

$ss = Get-Content src\services\StudentService.ts -Raw
$ss = $ss -replace "AuthUser, ", ""
Set-Content src\services\StudentService.ts $ss
