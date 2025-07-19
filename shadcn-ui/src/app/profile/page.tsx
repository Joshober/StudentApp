"use client";

/*
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------  N O T I C E  -  D I S C L A I M E R  ----------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

    ________________________________________________________________________
   |                                                                        |
   |   ⚠️⚠️⚠️   THIS IS NOT THE INTENDED DESIGN OR IMPLEMENTATION   ⚠️⚠️⚠️   |
   |                                                                        |
   |   ---------------------------------------------------------------      |
   |   |                                                             |      |
   |   |   THIS PAGE IS PURELY A PLACEHOLDER FOR THE FUTURE!         |      |
   |   |                                                             |      |
   |   ---------------------------------------------------------------      |
   |                                                                        |
   |   >>>>   DO NOT CONSIDER THIS FINAL OR REPRESENTATIVE CODE   <<<<      |
   |________________________________________________________________________|

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------  N O T I C E  -  D I S C L A I M E R  ----------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
*/

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Save, X, Upload } from "lucide-react";

const defaultProfilePic =
  "https://ui-avatars.com/api/?name=User&background=6d28d9&color=fff&size=128";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [previewPic, setPreviewPic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Please sign in to view your profile
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setName(user.name || "");
    setProfilePic(defaultProfilePic);
    setPreviewPic(null);
  };
  const handleSave = () => {
    // Here you would call an API to save changes
    setIsEditing(false);
    if (previewPic) setProfilePic(previewPic);
    // Optionally update user context
  };
  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewPic(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl rounded-3xl mb-8">
          <CardHeader className="flex flex-col items-center pb-0">
            <div className="relative w-32 h-32 mb-4">
              <img
                src={previewPic || profilePic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
              />
              {isEditing && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="absolute bottom-2 right-2 bg-white/80 border border-indigo-200 shadow"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-indigo-600" />
                </Button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handlePicChange}
              />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold text-center"
                  maxLength={40}
                />
              ) : (
                name || "Unnamed User"
              )}
            </CardTitle>
            <div className="mt-2">
              <Badge
                variant="outline"
                className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1 rounded-full"
              >
                <User className="inline w-4 h-4 mr-1" />
                {email}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <div className="flex flex-col gap-6">
              {/* Name Field */}
              <div>
                <div className="text-sm text-slate-600 mb-1">Name</div>
                {isEditing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    maxLength={40}
                  />
                ) : (
                  <div className="text-lg font-medium text-slate-900">
                    {name || "Unnamed User"}
                  </div>
                )}
              </div>
              {/* Email Field */}
              <div>
                <div className="text-sm text-slate-600 mb-1">Email</div>
                <div className="text-lg font-medium text-slate-900">
                  {email}
                </div>
              </div>
              {/* Profile Picture Field */}
              <div>
                <div className="text-sm text-slate-600 mb-1">
                  Profile Picture
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={previewPic || profilePic}
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                  />
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Picture
                    </Button>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
