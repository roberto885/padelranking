"use client";
import{useEffect,useState}from"react";
export function TvRefresh(){const[last,setLast]=useState(new Date());useEffect(()=>{const timer=setInterval(()=>setLast(new Date()),15000);return()=>clearInterval(timer)},[]);return <span className="tv-updated">Actualizado {last.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}</span>}
