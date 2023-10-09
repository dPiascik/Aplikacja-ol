using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class PositionDataController : ControllerBase
{
    private readonly DatabaseContext _context;

    public PositionDataController(DatabaseContext context)
    {
        _context = context;
    }
    [HttpGet]
public async Task<ActionResult<IEnumerable<PositionData>>> GetPositionData()
{
    return await _context.PositionData.ToListAsync();
}
[HttpGet("{id}")]
public async Task<ActionResult<PositionData>> GetPositionData(int id)
{
    var positionData = await _context.PositionData.FindAsync(id);

    if (positionData == null)
    {
        return NotFound();
    }

    return positionData;
}
[HttpPost]
public async Task<ActionResult<PositionData>> PostPositionData(PositionData positionData)
{
    _context.PositionData.Add(positionData);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetPositionData), new { id = positionData.Id }, positionData);
}
[HttpDelete("{id}")]
public async Task<IActionResult> DeletePositionData(int id)
{
    var positionData = await _context.PositionData.FindAsync(id);
    if (positionData == null)
    {
        return NotFound();
    }

    _context.PositionData.Remove(positionData);
    await _context.SaveChangesAsync();

    return NoContent();
}

}