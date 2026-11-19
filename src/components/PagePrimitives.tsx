import type { ReactNode } from 'react';
import { Activity } from 'lucide-react';
export function Header({tag,title,desc,action}:{tag:string,title:string,desc:string,action?:ReactNode}){return <div className="page-head"><div><label>{tag}</label><h1>{title}</h1><p>{desc}</p></div>{action}</div>}
export function PanelTitle({tag,title,action}:{tag:string,title:string,action?:ReactNode}){return <div className="panel-title"><div><label>{tag}</label><h3>{title}</h3></div>{action}</div>}
export function Metric({label,value,unit,note,icon:Icon,tone}:{label:string,value:string,unit?:string,note:string,icon:typeof Activity,tone:string}){return <article className="metric"><div className="metric-head">{label}<span className={'metric-icon '+tone}><Icon size={18}/></span></div><strong>{value}<small>{unit}</small></strong><p>{note}</p></article>}
