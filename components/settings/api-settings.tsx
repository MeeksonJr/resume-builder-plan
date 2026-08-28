"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
    Key, Trash, Copy, AlertTriangle, Check, Terminal, Code, Info, Loader2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ApiSettings() {
    const [loading, setLoading] = React.useState(false);
    const [fetching, setFetching] = React.useState(true);
    const [keys, setKeys] = React.useState<any[]>([]);
    const [keyName, setKeyName] = React.useState("");
    const [newKey, setNewKey] = React.useState<any | null>(null);
    const [copiedToken, setCopiedToken] = React.useState(false);

    const fetchKeys = React.useCallback(async () => {
        try {
            const res = await fetch("/api/settings/api-keys");
            if (!res.ok) throw new Error("Failed to fetch keys");
            const data = await res.json();
            setKeys(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load API keys");
        } finally {
            setFetching(false);
        }
    }, []);

    React.useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyName.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/settings/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: keyName }),
            });

            if (!res.ok) throw new Error("Failed to generate key");
            const data = await res.json();
            
            setNewKey(data);
            setKeyName("");
            toast.success("API key generated successfully!");
            fetchKeys();
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate API key");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKey = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to revoke this API key? Any applications currently using this key will immediately lose access.");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/settings/api-keys?id=${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to revoke key");
            toast.success("API Key successfully revoked");
            fetchKeys();
        } catch (error) {
            console.error(error);
            toast.error("Failed to revoke API key");
        }
    };

    const handleCopy = (token: string) => {
        navigator.clipboard.writeText(token);
        setCopiedToken(true);
        toast.success("API Key copied to clipboard!");
        setTimeout(() => setCopiedToken(false), 3000);
    };

    return (
        <div className="space-y-8">
            {/* Generate Key */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">Generate API Key</h3>
                <p className="text-sm text-muted-foreground">
                    Create API tokens to securely retrieve your resumes programmatically in JSON Resume standard format.
                </p>

                <form onSubmit={handleCreateKey} className="flex gap-3 max-w-lg">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="keyName" className="sr-only">Key Name</Label>
                        <Input
                            id="keyName"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            placeholder="e.g. My Website Integration"
                            className="rounded-none border-[#102b2b]/15 bg-white text-[#102b2b]"
                            disabled={loading}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274]"
                        disabled={loading || !keyName.trim()}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Generate Key
                    </Button>
                </form>
            </div>

            {/* Newly Created Key Alert Box */}
            {newKey && (
                <div className="border-2 border-yellow-300 bg-yellow-50 p-5 space-y-3 max-w-2xl rounded-none animate-in fade-in duration-300">
                    <div className="flex gap-2 text-yellow-800">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <h4 className="font-bold text-sm">Save your developer key now!</h4>
                    </div>
                    <p className="text-xs text-yellow-800/80">
                        For security reasons, this key will only be shown once. Copy it now and store it in a safe place.
                    </p>
                    <div className="flex items-center gap-2 border border-yellow-200 bg-white p-2 text-sm font-mono text-gray-700">
                        <span className="flex-1 truncate">{newKey.rawToken}</span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopy(newKey.rawToken)}
                            className="h-8 w-8 p-0"
                        >
                            {copiedToken ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => setNewKey(null)}
                        className="rounded-none font-bold"
                    >
                        I've stored it safely
                    </Button>
                </div>
            )}

            {/* Active Keys List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">Active API Keys</h3>

                {fetching ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-[#0d8274]" />
                        Loading API keys...
                    </div>
                ) : keys.length === 0 ? (
                    <div className="text-sm text-muted-foreground border border-dashed border-[#102b2b]/15 bg-[#f5f7f2] p-8 text-center">
                        <Key className="h-8 w-8 text-[#0d8274]/55 mx-auto mb-3" />
                        No active developer tokens. Create one above to begin programmatically accessing your profiles.
                    </div>
                ) : (
                    <div className="border border-[#102b2b]/15 bg-white divide-y divide-[#102b2b]/10 rounded-none overflow-hidden max-w-3xl">
                        {keys.map((key) => (
                            <div key={key.id} className="flex items-center justify-between p-4 hover:bg-[#e9eee8]/35 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{key.name}</span>
                                        <code className="text-xs bg-[#f5f7f2] text-gray-600 px-1.5 py-0.5 rounded font-mono">{key.token_preview}</code>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                        <span>
                                            Last Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}
                                        </span>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeleteKey(key.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Developer Documentation */}
            <div className="space-y-4 max-w-3xl border-t border-[#102b2b]/15 pt-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Code className="h-5 w-5 text-[#0d8274]" />
                    Developer API Quickstart
                </h3>
                <p className="text-sm text-muted-foreground">
                    Use curl or any HTTP library to query your resume records in standard JSON Resume structure.
                </p>

                <div className="space-y-4">
                    {/* Fetch list */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5" />
                            List Resumes
                        </span>
                        <div className="bg-[#102b2b] text-white p-3 rounded-none text-xs font-mono select-all overflow-x-auto">
                            curl -H "Authorization: Bearer YOUR_API_KEY" https://resumeforge.app/api/v1/resumes
                        </div>
                    </div>

                    {/* Fetch details */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5" />
                            Get Specific Resume Details (JSON Resume format)
                        </span>
                        <div className="bg-[#102b2b] text-white p-3 rounded-none text-xs font-mono select-all overflow-x-auto">
                            curl -H "Authorization: Bearer YOUR_API_KEY" "https://resumeforge.app/api/v1/resumes?id=YOUR_RESUME_UUID"
                        </div>
                    </div>

                    {/* Browser Extension Autofill Context */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5" />
                            Browser Extension Autofill Context (Flat format for form filling)
                        </span>
                        <div className="bg-[#102b2b] text-white p-3 rounded-none text-xs font-mono select-all overflow-x-auto">
                            curl -H "Authorization: Bearer YOUR_API_KEY" https://resumeforge.app/api/v1/autofill
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
