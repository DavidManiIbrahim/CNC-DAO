import { describe, it, expect, beforeEach } from "vitest"
import {
  latLngToXY,
  getSeedTrees,
  isSeedTree,
  getUserTrees,
  addUserTree,
  updateTreeStatus,
  removeUserTree,
  getAllTrees,
} from "@/lib/registeredTrees"

describe("Registered Trees & Projection (Unit Tests)", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("latLngToXY Projection", () => {
    it("maps (0, 0) to exactly (50%, 50%) center of map", () => {
      const { x, y } = latLngToXY(0, 0)
      expect(x).toBe(50)
      expect(y).toBe(50)
    })

    it("maps extreme boundaries correctly", () => {
      // North pole, Prime meridian: (90, 0) -> (50%, 0%)
      const northPole = latLngToXY(90, 0)
      expect(northPole.x).toBe(50)
      expect(northPole.y).toBe(0)

      // South pole: (-90, 0) -> (50%, 100%)
      const southPole = latLngToXY(-90, 0)
      expect(southPole.x).toBe(50)
      expect(southPole.y).toBe(100)

      // Date line east: (0, 180) -> (100%, 50%)
      const dateLineEast = latLngToXY(0, 180)
      expect(dateLineEast.x).toBe(100)
      expect(dateLineEast.y).toBe(50)

      // Date line west: (0, -180) -> (0%, 50%)
      const dateLineWest = latLngToXY(0, -180)
      expect(dateLineWest.x).toBe(0)
      expect(dateLineWest.y).toBe(50)
    })
  })

  describe("Seed Trees", () => {
    it("returns initial seed trees", () => {
      const seeds = getSeedTrees()
      expect(seeds.length).toBeGreaterThanOrEqual(2)
      expect(isSeedTree("neem-001")).toBe(true)
      expect(isSeedTree("mango-001")).toBe(true)
      expect(isSeedTree("non-existent-tree")).toBe(false)
    })
  })

  describe("Local Storage CRUD Helpers", () => {
    it("adds a tree to localStorage and retrieves it", () => {
      expect(getUserTrees()).toEqual([])

      const added = addUserTree({
        name: "Test Tree",
        species: "Iroko",
        location: "Ibadan, Nigeria",
        lat: 7.3775,
        lng: 3.947,
        status: "pending",
      })

      expect(added?.id).toBeDefined()
      const userTrees = getUserTrees()
      expect(userTrees.length).toBe(1)
      expect(userTrees[0].name).toBe("Test Tree")
      expect(getAllTrees().length).toBe(getSeedTrees().length + 1)
    })

    it("updates tree verification status", () => {
      const added = addUserTree({
        name: "Status Tree",
        species: "Mahogany",
        location: "Enugu, Nigeria",
        lat: 6.4584,
        lng: 7.5464,
        status: "pending",
      })

      updateTreeStatus(added!.id, "verified")
      const updated = getUserTrees().find((t) => t.id === added!.id)
      expect(updated?.status).toBe("verified")
    })

    it("removes tree from localStorage", () => {
      const added = addUserTree({
        name: "Tree to Delete",
        species: "Cashew",
        location: "Kaduna, Nigeria",
        lat: 10.5105,
        lng: 7.4165,
        status: "pending",
      })

      expect(getUserTrees().length).toBe(1)
      removeUserTree(added!.id)
      expect(getUserTrees().length).toBe(0)
    })
  })
})
