"use client";
import { useState } from "react";
import { FinderButton } from "./FinderButton";
export function CopyEmail({email}:{email:string}) {
  const [result,setResult]=useState("");
  async function copy() {
    try {await navigator.clipboard.writeText(email);setResult("Copied");}
    catch {setResult("Select the address to copy");}
  }
  return <div className="flex flex-wrap items-center gap-3"><FinderButton type="button" variant="outline" size="sm" onClick={copy}>Copy email</FinderButton><span role="status" className="text-xs text-muted-foreground">{result}</span></div>;
}
