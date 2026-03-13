"use client"

import { useEffect, useState } from "react"
import axios from "axios"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BASE_URL } from "@/lib/constants/index"

interface Package {
  _id: string
  name: string
  price: number
  description: string
  features: string[]
}

export default function PackagesPage() {

  const [packages,setPackages] = useState<Package[]>([])
  const [name,setName] = useState("")
  const [price,setPrice] = useState("")
  const [description,setDescription] = useState("")

  const fetchPackages = async () => {
    const res = await axios.get(`${BASE_URL}/tarvelpackages`)
    setPackages(res.data)
  }

  useEffect(()=>{
    fetchPackages()
  },[])

  const createPackage = async () => {

    await axios.post(`${BASE_URL}/tarvelpackages`,{
      name,
      price:Number(price),
      description,
      features:[]
    })

    setName("")
    setPrice("")
    setDescription("")

    fetchPackages()
  }

  return (
    <div className="p-10 space-y-10">

      <div className="max-w-md space-y-4">

        <h2 className="text-xl font-bold">Create Package</h2>

        <Input
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <Input
          placeholder="Price"
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
        />

        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <Button onClick={createPackage}>
          Create Package
        </Button>

      </div>

      <div className="grid grid-cols-3 gap-6">

        {packages.map((pkg)=>(
          <Card key={pkg._id}>

            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
            </CardHeader>

            <CardContent>

              <p className="text-sm text-muted-foreground mb-2">
                {pkg.description}
              </p>

              <p className="font-bold">
                ${pkg.price}
              </p>

            </CardContent>

          </Card>
        ))}

      </div>

    </div>
  )
}